import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { factoryFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { factoryTemplate } from '../templates/templates'

export const newFactoryCommand = defineCommand({
  meta: { name: 'factory', description: 'Create a Factory for an aggregate.' },
  args: {
    aggregate: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const root = process.cwd()
    const aggregate = String(args.aggregate)
    const path = factoryFile(root, `${aggregate}Factory`)
    const content = render(factoryTemplate, {
      Aggregate: aggregate,
      context: String(args.context),
      module: String(args.module),
    })
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
