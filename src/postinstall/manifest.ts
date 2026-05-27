import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export type ManifestTarget = 'claude' | 'cursor'

export interface ManifestEntry {
  readonly name: string
  readonly target: ManifestTarget
  readonly destination: string
  readonly linkedAt: string
}

export interface SkillManifest {
  readonly version: 1
  readonly entries: ManifestEntry[]
}

export function manifestPath(projectRoot: string, target: ManifestTarget): string {
  if (target === 'claude') return join(projectRoot, '.claude', 'skills', '.laravelize-manifest.json')
  return join(projectRoot, '.cursor', 'rules', '.laravelize-manifest.json')
}

export function readManifest(path: string): SkillManifest {
  if (!existsSync(path)) return { version: 1, entries: [] }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as SkillManifest
    if (typeof parsed !== 'object' || parsed === null || parsed.version !== 1) return { version: 1, entries: [] }
    return parsed
  } catch {
    return { version: 1, entries: [] }
  }
}

export function writeManifest(path: string, manifest: SkillManifest): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

export function upsertEntry(manifest: SkillManifest, entry: ManifestEntry): SkillManifest {
  const filtered = manifest.entries.filter((e) => !(e.name === entry.name && e.target === entry.target))
  return { version: 1, entries: [...filtered, entry] }
}

export function removeEntry(manifest: SkillManifest, name: string, target: ManifestTarget): SkillManifest {
  return {
    version: 1,
    entries: manifest.entries.filter((e) => !(e.name === name && e.target === target)),
  }
}
