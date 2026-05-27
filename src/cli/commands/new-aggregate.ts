import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { domainFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { aggregateTemplate } from '../templates/templates'

export const newAggregateCommand = defineCommand({
  meta: { name: 'aggregate', description: 'Create an aggregate root in domain/.' },
  args: {
    name: { type: 'positional', required: true, description: 'Aggregate name (PascalCase)' },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const scope = { root: process.cwd(), context: String(args.context), module: String(args.module) }
    const content = render(aggregateTemplate, { Aggregate: String(args.name) })
    const path = domainFile(scope, `${String(args.name)}.ts`)
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
