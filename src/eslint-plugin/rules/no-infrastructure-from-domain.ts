import { createRule } from '../utils/createRule'
import { isInLayer, resolveImportLayer } from '../utils/pathClassifier'

export const noInfrastructureFromDomain = createRule({
  name: 'no-infrastructure-from-domain',
  meta: {
    type: 'problem',
    docs: { description: 'Disallow imports from infrastructure/ inside the domain layer.' },
    schema: [],
    messages: {
      forbidden: 'Domain layer must not import from infrastructure/. Move the dependency behind an interface in domain/.',
    },
  },
  defaultOptions: [],
  create(context) {
    if (!isInLayer(context.filename, 'domain')) return {}
    return {
      ImportDeclaration(node) {
        const importLayer = resolveImportLayer(context.filename, node.source.value)
        if (importLayer === 'infrastructure') {
          context.report({ node, messageId: 'forbidden' })
        }
      },
    }
  },
})
