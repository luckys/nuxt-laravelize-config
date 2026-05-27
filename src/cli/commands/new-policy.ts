import { defineCommand } from 'citty'

import { writeArtifact } from '../fs/writeArtifact'
import { policyFile } from '../fs/pathResolver'
import { render } from '../render/renderTemplate'
import { policyTemplate } from '../templates/templates'

export const newPolicyCommand = defineCommand({
  meta: { name: 'policy', description: 'Create an authorization policy in server/policies/.' },
  args: {
    aggregate: { type: 'positional', required: true },
    force: { type: 'boolean', default: false },
  },
  async run({ args }) {
    const root = process.cwd()
    const aggregate = String(args.aggregate)
    const path = policyFile(root, `${aggregate}Policy`)
    const content = render(policyTemplate, { Aggregate: aggregate })
    const result = writeArtifact(path, content, { force: Boolean(args.force) })
    process.stdout.write(`${result === 'skipped' ? '·' : '✓'} ${result}: ${path}\n`)
  },
})
