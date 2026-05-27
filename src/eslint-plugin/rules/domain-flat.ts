import { createRule } from '../utils/createRule'

const DOMAIN_SUBFOLDER = /\/contexts\/[^/]+\/(?:[^/]+\/)?domain\/([^/]+)\/[^/]+$/

export const domainFlat = createRule({
  name: 'domain-flat',
  meta: {
    type: 'problem',
    docs: { description: 'Domain folder must be flat — no subdirectories.' },
    schema: [],
    messages: {
      noSubfolder: 'Domain layer is flat. Move "{{file}}" to the top of domain/ (no value-objects/, aggregates/ subfolders).',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(node) {
        const match = context.filename.replace(/\\/g, '/').match(DOMAIN_SUBFOLDER)
        if (match === null) return
        context.report({ node, messageId: 'noSubfolder', data: { file: context.filename } })
      },
    }
  },
})
