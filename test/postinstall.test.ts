import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { linkSkills, detectTargets } from '../src/postinstall/linkSkills'
import { unlinkSkills } from '../src/postinstall/unlinkSkills'
import { skillsStatus } from '../src/postinstall/status'
import { convertSkillMdToCursorMdc } from '../src/postinstall/cursorConverter'
import { listSkillSources } from '../src/postinstall/skillSources'
import { manifestPath, readManifest } from '../src/postinstall/manifest'

describe('skill sources', () => {
  it('finds the bundled skills', () => {
    const sources = listSkillSources()
    expect(sources.length).toBeGreaterThanOrEqual(15)
    expect(sources.map((s) => s.name)).toContain('nuxt-laravelize-ddd-overview')
    expect(sources.every((s) => s.description.length > 0)).toBe(true)
  })
})

describe('cursorConverter', () => {
  it('rewrites Anthropic frontmatter to MDC frontmatter', () => {
    const sources = listSkillSources()
    const overview = sources.find((s) => s.name === 'nuxt-laravelize-ddd-overview')
    expect(overview).toBeDefined()
    const mdc = convertSkillMdToCursorMdc(overview!.skillMdPath)
    expect(mdc.startsWith('---\n')).toBe(true)
    expect(mdc).toContain('description: ')
    expect(mdc).toContain('globs:')
    expect(mdc).toContain('alwaysApply: false')
  })
})

describe('linkSkills / unlinkSkills / status', () => {
  let projectRoot: string

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'nlz-test-'))
  })

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true })
  })

  it('returns empty when no targets are detected', () => {
    const reports = linkSkills({ projectRoot })
    expect(reports).toHaveLength(0)
    expect(detectTargets(projectRoot)).toHaveLength(0)
  })

  it('links every bundled skill into .claude/skills and writes a manifest', () => {
    mkdirSync(join(projectRoot, '.claude', 'skills'), { recursive: true })

    const reports = linkSkills({ projectRoot })
    const sources = listSkillSources()

    expect(reports.length).toBe(sources.length)
    expect(reports.every((r) => r.target === 'claude')).toBe(true)
    expect(reports.every((r) => r.result === 'linked' || r.result === 'copied')).toBe(true)
    for (const s of sources) {
      expect(existsSync(join(projectRoot, '.claude', 'skills', s.name, 'SKILL.md'))).toBe(true)
    }
    const manifest = readManifest(manifestPath(projectRoot, 'claude'))
    expect(manifest.entries).toHaveLength(sources.length)
  })

  it('also links to .cursor/rules when present, transforming to .mdc', () => {
    mkdirSync(join(projectRoot, '.claude', 'skills'), { recursive: true })
    mkdirSync(join(projectRoot, '.cursor', 'rules'), { recursive: true })

    linkSkills({ projectRoot })

    const sources = listSkillSources()
    for (const s of sources) {
      const mdcPath = join(projectRoot, '.cursor', 'rules', `${s.name}.mdc`)
      expect(existsSync(mdcPath)).toBe(true)
      const content = readFileSync(mdcPath, 'utf8')
      expect(content).toContain('description:')
      expect(content).toContain('globs:')
    }
  })

  it('is idempotent — running linkSkills twice produces no conflicts', () => {
    mkdirSync(join(projectRoot, '.claude', 'skills'), { recursive: true })

    const first = linkSkills({ projectRoot })
    const second = linkSkills({ projectRoot })

    expect(first.length).toBe(second.length)
    expect(second.every((r) => r.result === 'noop' || r.result === 'linked' || r.result === 'copied')).toBe(true)
  })

  it('respects an explicit target list', () => {
    mkdirSync(join(projectRoot, '.cursor', 'rules'), { recursive: true })

    const reports = linkSkills({ projectRoot, targets: ['cursor'] })
    expect(reports.every((r) => r.target === 'cursor')).toBe(true)
    expect(existsSync(join(projectRoot, '.claude'))).toBe(false)
  })

  it('refuses to overwrite a non-symlink file unless force is set', () => {
    const skillsDir = join(projectRoot, '.claude', 'skills')
    mkdirSync(skillsDir, { recursive: true })
    const collisionDir = join(skillsDir, 'create-aggregate')
    mkdirSync(collisionDir, { recursive: true })
    const collisionPath = join(collisionDir, 'SKILL.md')
    writeFileSync(collisionPath, '# local override\n')

    const reports = linkSkills({ projectRoot })
    const collisionReport = reports.find((r) => r.name === 'create-aggregate' && r.target === 'claude')
    expect(collisionReport?.result).toBe('conflict')
    expect(readFileSync(collisionPath, 'utf8')).toBe('# local override\n')

    const forced = linkSkills({ projectRoot, force: true })
    const forcedReport = forced.find((r) => r.name === 'create-aggregate' && r.target === 'claude')
    expect(forcedReport?.result === 'linked' || forcedReport?.result === 'copied').toBe(true)
  })

  it('unlinkSkills removes every entry recorded in the manifest', () => {
    mkdirSync(join(projectRoot, '.claude', 'skills'), { recursive: true })
    linkSkills({ projectRoot })

    const reports = unlinkSkills({ projectRoot })
    expect(reports.every((r) => r.removed)).toBe(true)

    const remaining = readManifest(manifestPath(projectRoot, 'claude'))
    expect(remaining.entries).toHaveLength(0)
  })

  it('skillsStatus reports bundled skills and current links', () => {
    mkdirSync(join(projectRoot, '.claude', 'skills'), { recursive: true })

    const before = skillsStatus(projectRoot)
    expect(before.statuses).toHaveLength(0)
    expect(before.detectedTargets).toEqual(['claude'])

    linkSkills({ projectRoot })
    const after = skillsStatus(projectRoot)

    expect(after.statuses.length).toBe(before.bundledSkills.length)
    expect(after.statuses.every((s) => s.state === 'linked' || s.state === 'manifest-only')).toBe(true)
  })
})
