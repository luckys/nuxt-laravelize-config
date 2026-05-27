import { defineCommand } from 'citty'

import { linkSkills, detectTargets } from '../../postinstall/linkSkills'
import { unlinkSkills } from '../../postinstall/unlinkSkills'
import { skillsStatus } from '../../postinstall/status'
import type { ManifestTarget } from '../../postinstall/manifest'

const TARGET_ALL: readonly ManifestTarget[] = ['claude', 'cursor']

function parseTargets(rawInput: unknown): readonly ManifestTarget[] | undefined {
  const input = typeof rawInput === 'string' ? rawInput : undefined
  if (input === undefined || input === '') return undefined
  if (input === 'all') return TARGET_ALL
  if (input === 'claude' || input === 'cursor') return [input]
  throw new Error(`Unknown --target value: ${input}. Use claude, cursor, or all.`)
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

export const skillsCommand = defineCommand({
  meta: { name: 'skills', description: 'Manage nuxt-laravelize agent skills.' },
  subCommands: {
    install: defineCommand({
      meta: { description: 'Symlink bundled skills into .claude/skills and/or .cursor/rules.' },
      args: {
        target: { type: 'string', description: 'claude | cursor | all', default: undefined as string | undefined },
        force: { type: 'boolean', description: 'Overwrite existing files', default: false },
      },
      async run({ args }) {
        const root = process.cwd()
        const targets = parseTargets(args.target) ?? detectTargets(root)
        if (targets.length === 0) {
          process.stdout.write('No target detected. Create .claude/skills or .cursor/rules first.\n')
          return
        }
        const reports = linkSkills({
          projectRoot: root,
          targets,
          force: asBoolean(args.force),
          logger: (line) => process.stdout.write(`${line}\n`),
        })
        process.stdout.write(`\nLinked ${reports.length} skill destination(s).\n`)
      },
    }),
    unlink: defineCommand({
      meta: { description: 'Remove every skill recorded in the local manifest.' },
      args: {
        target: { type: 'string', description: 'claude | cursor | all', default: undefined as string | undefined },
      },
      async run({ args }) {
        const root = process.cwd()
        const targets = parseTargets(args.target) ?? detectTargets(root)
        const reports = unlinkSkills({
          projectRoot: root,
          targets,
          logger: (line) => process.stdout.write(`${line}\n`),
        })
        process.stdout.write(`\nRemoved ${reports.filter((r) => r.removed).length} skill(s).\n`)
      },
    }),
    status: defineCommand({
      meta: { description: 'Show bundled skills and what is currently linked.' },
      async run() {
        const snapshot = skillsStatus(process.cwd())
        process.stdout.write(`Bundled skills (${snapshot.bundledSkills.length}):\n`)
        for (const s of snapshot.bundledSkills) {
          process.stdout.write(`  • ${s.name} — ${s.description}\n`)
        }
        process.stdout.write(`\nDetected targets: ${snapshot.detectedTargets.join(', ') || '(none)'}\n`)
        if (snapshot.statuses.length === 0) {
          process.stdout.write('No skills currently linked.\n')
          return
        }
        process.stdout.write(`\nLinked:\n`)
        for (const st of snapshot.statuses) {
          process.stdout.write(`  [${st.target}] ${st.name} (${st.state}) → ${st.destination}\n`)
        }
      },
    }),
  },
})
