import { existsSync, lstatSync } from 'node:fs'

import { detectTargets } from './linkSkills'
import { manifestPath, readManifest, type ManifestTarget } from './manifest'
import { listSkillSources } from './skillSources'

export interface SkillStatus {
  readonly name: string
  readonly description: string
  readonly target: ManifestTarget
  readonly destination: string
  readonly linkedAt: string
  readonly state: 'linked' | 'broken' | 'manifest-only'
}

export interface StatusSnapshot {
  readonly bundledSkills: ReadonlyArray<{ name: string; description: string }>
  readonly detectedTargets: readonly ManifestTarget[]
  readonly statuses: readonly SkillStatus[]
}

export function skillsStatus(projectRoot: string): StatusSnapshot {
  const sources = listSkillSources()
  const targets = detectTargets(projectRoot)
  const statuses: SkillStatus[] = []

  for (const target of targets) {
    const manifest = readManifest(manifestPath(projectRoot, target))
    for (const entry of manifest.entries) {
      statuses.push({
        name: entry.name,
        description: sources.find((s) => s.name === entry.name)?.description ?? '',
        target,
        destination: entry.destination,
        linkedAt: entry.linkedAt,
        state: resolveState(entry.destination),
      })
    }
  }

  return {
    bundledSkills: sources.map((s) => ({ name: s.name, description: s.description })),
    detectedTargets: targets,
    statuses,
  }
}

function resolveState(destination: string): 'linked' | 'broken' | 'manifest-only' {
  if (!existsSync(destination)) return 'manifest-only'
  try {
    if (lstatSync(destination).isSymbolicLink() && !existsSync(destination)) return 'broken'
  } catch {
    return 'broken'
  }
  return 'linked'
}
