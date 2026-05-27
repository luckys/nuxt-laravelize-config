import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { seederFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { seederTemplate } from '../templates/templates'

export const newSeederCommand = defineCommand({
  meta: { name: 'seeder', description: 'Create a database seeder.' },
  args: {
    name: { type: 'positional', required: true },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const root = process.cwd()
    const name = String(args.name).replace(/Seeder$/, '')
    const path = seederFile(root, name)
    const content = render(seederTemplate, { Name: name })
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
