import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { responseFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { resourceTemplate } from '../templates/templates'

export const newResourceCommand = defineCommand({
  meta: { name: 'resource', description: 'Create an API Resource in server/responses/.' },
  args: {
    name: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    aggregate: { type: 'string', required: true },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const root = process.cwd()
    const name = String(args.name)
    const path = responseFile(root, `${name}Resource`)
    const content = render(resourceTemplate, {
      Name: name,
      Aggregate: String(args.aggregate),
      context: String(args.context),
      module: String(args.module),
    })
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
