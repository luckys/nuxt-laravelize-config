import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { convertSkillMdToCursorMdc } from './cursorConverter'
import { linkFile, type LinkResult } from './platform'
import { listSkillSources, type SkillSource } from './skillSources'
import {
  manifestPath,
  readManifest,
  upsertEntry,
  writeManifest,
  type ManifestTarget,
} from './manifest'

export interface LinkSkillsOptions {
  readonly projectRoot: string
  readonly targets?: readonly ManifestTarget[]
  readonly force?: boolean
  readonly logger?: (line: string) => void
}

export interface SkillLinkReport {
  readonly target: ManifestTarget
  readonly name: string
  readonly destination: string
  readonly result: LinkResult
}

export function linkSkills(options: LinkSkillsOptions): readonly SkillLinkReport[] {
  const { projectRoot, force = false, logger = noop } = options
  const targets = options.targets ?? detectTargets(projectRoot)
  if (targets.length === 0) {
    logger('No supported skill targets detected (.claude/skills or .cursor/rules). Skipping.')
    return []
  }

  const sources = listSkillSources()
  if (sources.length === 0) {
    logger('No bundled skills found. Build the package first.')
    return []
  }

  const reports: SkillLinkReport[] = []
  for (const target of targets) {
    ensureTargetDir(projectRoot, target)
    let manifest = readManifest(manifestPath(projectRoot, target))
    for (const source of sources) {
      const destination = destinationFor(projectRoot, target, source)
      const result = linkOne(source, destination, target, force)
      reports.push({ target, name: source.name, destination, result })
      if (result === 'linked' || result === 'copied' || result === 'rewritten') {
        manifest = upsertEntry(manifest, {
          name: source.name,
          target,
          destination,
          linkedAt: new Date().toISOString(),
        })
      }
      logger(`[${target}] ${source.name}: ${result} → ${destination}`)
    }
    writeManifest(manifestPath(projectRoot, target), manifest)
  }
  return reports
}

function destinationFor(projectRoot: string, target: ManifestTarget, source: SkillSource): string {
  if (target === 'claude') return join(projectRoot, '.claude', 'skills', source.name, 'SKILL.md')
  return join(projectRoot, '.cursor', 'rules', `${source.name}.mdc`)
}

function linkOne(source: SkillSource, destination: string, target: ManifestTarget, force: boolean): LinkResult {
  if (target === 'claude') {
    return linkFile(source.skillMdPath, destination, { force, allowCopyFallback: true })
  }
  const mdcContent = convertSkillMdToCursorMdc(source.skillMdPath)
  return linkFile(source.skillMdPath, destination, {
    force,
    allowCopyFallback: true,
    contentForCopy: mdcContent,
    writeContentInsteadOfLink: true,
  })
}

function ensureTargetDir(projectRoot: string, target: ManifestTarget): void {
  const dir = target === 'claude' ? join(projectRoot, '.claude', 'skills') : join(projectRoot, '.cursor', 'rules')
  mkdirSync(dir, { recursive: true })
}

export function detectTargets(projectRoot: string): readonly ManifestTarget[] {
  const detected: ManifestTarget[] = []
  if (existsSync(join(projectRoot, '.claude', 'skills'))) detected.push('claude')
  if (existsSync(join(projectRoot, '.cursor', 'rules'))) detected.push('cursor')
  return detected
}

function noop(_line: string): void {}
