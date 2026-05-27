import { defineCommand } from 'citty'
import { join } from 'node:path'

import { writeArtifact } from '../fs/writeArtifact'
import { frontendContextRoot, serverContextRoot } from '../fs/pathResolver'

export const newContextCommand = defineCommand({
  meta: { name: 'context', description: 'Scaffold a new bounded context (backend + frontend).' },
  args: {
    name: { type: 'positional', required: true, description: 'Context name (kebab-case)' },
    target: { type: 'string', default: 'fullstack', description: 'backend | frontend | fullstack' },
  },
  async run({ args }) {
    const root = process.cwd()
    const target = String(args.target)
    if (target === 'backend' || target === 'fullstack') {
      writeArtifact(join(serverContextRoot(root, String(args.name)), '.gitkeep'), '')
    }
    if (target === 'frontend' || target === 'fullstack') {
      writeArtifact(join(frontendContextRoot(root, String(args.name)), '.gitkeep'), '')
    }
    process.stdout.write(`✓ context "${String(args.name)}" created\n`)
  },
})
