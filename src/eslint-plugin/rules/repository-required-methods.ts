import { createRule } from '../utils/createRule'
import { getInterfaceDeclarations } from '../utils/astHelpers'

const REQUIRED_METHODS = ['save', 'find', 'search', 'searchPaginated', 'count'] as const

export const repositoryRequiredMethods = createRule({
  name: 'repository-required-methods',
  meta: {
    type: 'problem',
    docs: { description: 'Repository interfaces must declare save, find, search, searchPaginated, count.' },
    schema: [
      {
        type: 'object',
        properties: {
          required: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingMethod: 'Repository "{{interface}}" is missing required method "{{method}}".',
    },
  },
  defaultOptions: [{ required: [...REQUIRED_METHODS] }],
  create(context, [options]) {
    const required = options.required ?? REQUIRED_METHODS
    return {
      Program(program) {
        for (const iface of getInterfaceDeclarations(program)) {
          if (!iface.id.name.endsWith('Repository')) continue
          const present = new Set<string>()
          for (const member of iface.body.body) {
            if (member.type === 'TSMethodSignature' && member.key.type === 'Identifier') {
              present.add(member.key.name)
            }
            if (member.type === 'TSPropertySignature' && member.key.type === 'Identifier') {
              present.add(member.key.name)
            }
          }
          for (const method of required) {
            if (!present.has(method)) {
              context.report({ node: iface.id, messageId: 'missingMethod', data: { interface: iface.id.name, method } })
            }
          }
        }
      },
    }
  },
})
