import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { domainFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import {
  valueObjectEnumTemplate,
  valueObjectIntTemplate,
  valueObjectStringTemplate,
  valueObjectUuidTemplate,
} from '../templates/templates'

const TEMPLATES = {
  string: valueObjectStringTemplate,
  uuid: valueObjectUuidTemplate,
  int: valueObjectIntTemplate,
  enum: valueObjectEnumTemplate,
} as const

type VoType = keyof typeof TEMPLATES

export const newValueObjectCommand = defineCommand({
  meta: { name: 'value-object', description: 'Create a value object in domain/.' },
  args: {
    name: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    type: { type: 'string', default: 'string', description: 'string | uuid | int | enum' },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const type = String(args.type) as VoType
    if (!(type in TEMPLATES)) throw new Error(`Unknown --type=${type}. Use string, uuid, int, or enum.`)
    const scope = { root: process.cwd(), context: String(args.context), module: String(args.module) }
    const content = render(TEMPLATES[type], { Name: String(args.name) })
    const path = domainFile(scope, `${String(args.name)}.ts`)
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
