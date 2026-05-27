import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { applicationUseCaseFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { useCaseCommandTemplate, useCaseQueryTemplate } from '../templates/templates'

const TYPES = {
  command: useCaseCommandTemplate,
  query: useCaseQueryTemplate,
} as const

type UseCaseType = keyof typeof TYPES

export const newUseCaseCommand = defineCommand({
  meta: { name: 'use-case', description: 'Create a use case folder + class in application/.' },
  args: {
    name: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    aggregate: { type: 'string', required: true },
    type: { type: 'string', default: 'command', description: 'command | query' },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const type = String(args.type) as UseCaseType
    if (!(type in TYPES)) throw new Error(`Unknown --type=${type}. Use command or query.`)
    const scope = { root: process.cwd(), context: String(args.context), module: String(args.module) }
    const name = String(args.name)
    const path = applicationUseCaseFile(scope, name)
    const content = render(TYPES[type], { UseCase: name, Aggregate: String(args.aggregate) })
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
