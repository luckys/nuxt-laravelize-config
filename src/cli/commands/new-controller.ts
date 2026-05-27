import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { controllerFile, requestFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { controllerTemplate, formRequestTemplate } from '../templates/templates'

export const newControllerCommand = defineCommand({
  meta: { name: 'controller', description: 'Create a single-action controller + form request.' },
  args: {
    name: { type: 'positional', required: true, description: '{Verb}{Noun} (e.g., CreateInvoice)' },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const root = process.cwd()
    const name = String(args.name)
    const force = Boolean(args.force)

    const ctrlPath = controllerFile(root, `${name}Controller`)
    const ctrlContent = render(controllerTemplate, { Name: name })
    const ctrl = writeArtifact(ctrlPath, ctrlContent, { force })
    process.stdout.write(`${ctrl === 'skipped' ? '·' : '✓'} ${ctrl}: ${ctrlPath}\n`)

    const reqPath = requestFile(root, `${name}Request`)
    const reqContent = render(formRequestTemplate, { Name: name })
    const req = writeArtifact(reqPath, reqContent, { force })
    process.stdout.write(`${req === 'skipped' ? '·' : '✓'} ${req}: ${reqPath}\n`)
  },
})
