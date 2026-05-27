import { createRule } from '../utils/createRule'
import { isInLayer, resolveImportLayer } from '../utils/pathClassifier'

export const noApplicationFromDomain = createRule({
  name: 'no-application-from-domain',
  meta: {
    type: 'problem',
    docs: { description: 'Disallow imports from application/ inside the domain layer.' },
    schema: [],
    messages: {
      forbidden: 'Domain layer must not depend on application/. Domain knows nothing about use cases.',
    },
  },
  defaultOptions: [],
  create(context) {
    if (!isInLayer(context.filename, 'domain')) return {}
    return {
      ImportDeclaration(node) {
        const importLayer = resolveImportLayer(context.filename, node.source.value)
        if (importLayer === 'application') {
          context.report({ node, messageId: 'forbidden' })
        }
      },
    }
  },
})
