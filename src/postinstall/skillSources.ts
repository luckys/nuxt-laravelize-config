import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const candidates = [
  resolve(here, '..', 'skills'),       // dist layout: dist/postinstall → dist/skills
  resolve(here, '..', '..', 'src', 'skills'), // dev layout
  resolve(here, '..', '..', '..', 'src', 'skills'), // nested via ts loader
]

export interface SkillSource {
  readonly name: string
  readonly skillMdPath: string
  readonly description: string
}

export function locateSkillsRoot(): string | null {
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate
  }
  return null
}

export function listSkillSources(): readonly SkillSource[] {
  const root = locateSkillsRoot()
  if (root === null) return []
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const skillMdPath = join(root, e.name, 'SKILL.md')
      if (!existsSync(skillMdPath)) return null
      return {
        name: e.name,
        skillMdPath,
        description: extractDescription(skillMdPath),
      }
    })
    .filter((x): x is SkillSource => x !== null)
}

function extractDescription(path: string): string {
  const text = readFileSync(path, 'utf8')
  const match = text.match(/^description:\s*(.+)$/m)
  return match?.[1]?.trim().replace(/^["']|["']$/g, '') ?? ''
}
