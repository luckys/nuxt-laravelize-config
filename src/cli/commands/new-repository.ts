import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { domainFile, infrastructureFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import {
  repositoryDrizzleTemplate,
  repositoryInterfaceTemplate,
  repositoryMemoryTemplate,
} from '../templates/templates'

const IMPLS = {
  drizzle: { template: repositoryDrizzleTemplate, prefix: 'Drizzle' },
  memory: { template: repositoryMemoryTemplate, prefix: 'InMemory' },
} as const

type ImplType = keyof typeof IMPLS

export const newRepositoryCommand = defineCommand({
  meta: { name: 'repository', description: 'Create a repository interface + implementation.' },
  args: {
    aggregate: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    impl: { type: 'string', default: 'memory', description: 'drizzle | memory' },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const impl = String(args.impl) as ImplType
    if (!(impl in IMPLS)) throw new Error(`Unknown --impl=${impl}. Use drizzle or memory.`)
    const scope = { root: process.cwd(), context: String(args.context), module: String(args.module) }
    const aggregate = String(args.aggregate)
    const force = Boolean(args.force)

    const ifacePath = domainFile(scope, `${aggregate}Repository.ts`)
    const ifaceContent = render(repositoryInterfaceTemplate, { Aggregate: aggregate })
    const ifaceResult = writeArtifact(ifacePath, ifaceContent, { force })
    process.stdout.write(`${ifaceResult === 'skipped' ? '·' : '✓'} ${ifaceResult}: ${ifacePath}\n`)

    const implName = `${IMPLS[impl].prefix}${aggregate}Repository`
    const implPath = infrastructureFile(scope, `${implName}.ts`)
    const implContent = render(IMPLS[impl].template, { Aggregate: aggregate })
    const implResult = writeArtifact(implPath, implContent, { force })
    process.stdout.write(`${implResult === 'skipped' ? '·' : '✓'} ${implResult}: ${implPath}\n`)
  },
})
