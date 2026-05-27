import { dirname } from 'node:path'

import { removeDirIfEmpty, unlinkIfExists } from './platform'
import {
  manifestPath,
  readManifest,
  removeEntry,
  writeManifest,
  type ManifestTarget,
} from './manifest'
import { detectTargets } from './linkSkills'

export interface UnlinkSkillsOptions {
  readonly projectRoot: string
  readonly targets?: readonly ManifestTarget[]
  readonly logger?: (line: string) => void
}

export interface UnlinkReport {
  readonly target: ManifestTarget
  readonly name: string
  readonly destination: string
  readonly removed: boolean
}

export function unlinkSkills(options: UnlinkSkillsOptions): readonly UnlinkReport[] {
  const { projectRoot, logger = noop } = options
  const targets = options.targets ?? detectTargets(projectRoot)
  const reports: UnlinkReport[] = []

  for (const target of targets) {
    const path = manifestPath(projectRoot, target)
    let manifest = readManifest(path)
    for (const entry of [...manifest.entries]) {
      const removed = unlinkIfExists(entry.destination)
      if (removed && target === 'claude') {
        removeDirIfEmpty(dirname(entry.destination))
      }
      reports.push({ target, name: entry.name, destination: entry.destination, removed })
      manifest = removeEntry(manifest, entry.name, target)
      logger(`[${target}] ${entry.name}: ${removed ? 'removed' : 'absent'} ← ${entry.destination}`)
    }
    writeManifest(path, manifest)
  }
  return reports
}

function noop(_line: string): void {}
