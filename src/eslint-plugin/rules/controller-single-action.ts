import { createRule } from '../utils/createRule'
import { getExportedClasses, getMethodName, getPublicMethods } from '../utils/astHelpers'

export const controllerSingleAction = createRule({
  name: 'controller-single-action',
  meta: {
    type: 'problem',
    docs: { description: 'Controllers expose a single public method named invoke().' },
    schema: [],
    messages: {
      wrongName: 'Controller method must be "invoke", got "{{name}}".',
      tooManyMethods: 'Controller must be single-action. Split into separate controllers per endpoint.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          const name = cls.id?.name
          if (name === undefined || !name.endsWith('Controller')) continue
          const methods = getPublicMethods(cls)
          if (methods.length > 1) {
            context.report({ node: cls, messageId: 'tooManyMethods' })
            continue
          }
          if (methods.length === 1) {
            const methodName = getMethodName(methods[0]!)
            if (methodName !== 'invoke') {
              context.report({ node: methods[0]!, messageId: 'wrongName', data: { name: methodName ?? '<computed>' } })
            }
          }
        }
      },
    }
  },
})
