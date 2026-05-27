import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { applicationUseCaseFile } from '../fs/pathResolver'
import { render, toKebabCase } from '../render/renderTemplate'
import { listenerTemplate } from '../templates/templates'

export const newListenerCommand = defineCommand({
  meta: { name: 'listener', description: 'Create an event listener under application/.' },
  args: {
    name: { type: 'positional', required: true },
    context: { type: 'string', required: true },
    module: { type: 'string', required: true },
    event: { type: 'string', required: true },
    queued: { type: 'boolean', default: false },
    queue: { type: 'string', default: 'default' },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const scope = { root: process.cwd(), context: String(args.context), module: String(args.module) }
    const name = String(args.name)
    const queued = Boolean(args.queued)
    const queueStatic = queued ? `  static readonly QUEUE = '${String(args.queue)}'\n\n` : '\n'

    const content = render(listenerTemplate, {
      Name: name,
      Event: String(args.event),
      eventName: toKebabCase(`${String(args.module)}.${String(args.event)}`).replace(/-/g, '.'),
      queueStatic,
    })
    const path = applicationUseCaseFile(scope, name)
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
