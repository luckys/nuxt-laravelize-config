import { createRule } from '../utils/createRule'
import { isInLayer } from '../utils/pathClassifier'
import { getExportedClasses, getMethodName, getPublicMethods } from '../utils/astHelpers'

export const useCaseMethodExecute = createRule({
  name: 'use-case-method-execute',
  meta: {
    type: 'problem',
    docs: { description: 'Use cases expose exactly one public method named execute().' },
    schema: [],
    messages: {
      wrongName: 'Use case method must be "execute", got "{{name}}".',
      tooManyMethods: 'Use case must expose exactly one public method (execute). Found {{count}}.',
      missingExecute: 'Use case class "{{name}}" is missing the execute() method.',
    },
  },
  defaultOptions: [],
  create(context) {
    if (!isInLayer(context.filename, 'application')) return {}
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          if (cls.id === null) continue
          const methods = getPublicMethods(cls)
          if (methods.length === 0) {
            context.report({ node: cls, messageId: 'missingExecute', data: { name: cls.id.name } })
            continue
          }
          if (methods.length > 1) {
            context.report({ node: cls, messageId: 'tooManyMethods', data: { count: methods.length } })
            continue
          }
          const only = methods[0]!
          const name = getMethodName(only)
          if (name !== 'execute') {
            context.report({ node: only, messageId: 'wrongName', data: { name: name ?? '<computed>' } })
          }
        }
      },
    }
  },
})
