import { createRule } from '../utils/createRule'
import { getExportedClasses } from '../utils/astHelpers'

const KNOWN_VERBS = [
  'Find', 'Create', 'Update', 'Delete', 'List', 'Show', 'Send', 'Cancel',
  'Confirm', 'Reject', 'Approve', 'Publish', 'Archive', 'Restore', 'Search',
  'Generate', 'Import', 'Export', 'Sync', 'Refresh', 'Replay', 'Resume',
  'Pause', 'Start', 'Stop', 'Renew', 'Pay', 'Refund', 'Notify', 'Login',
  'Logout', 'Register', 'Verify',
] as const

export const controllerNaming = createRule({
  name: 'controller-naming',
  meta: {
    type: 'suggestion',
    docs: { description: 'Controllers follow {Verb}{Noun}Controller naming.' },
    schema: [
      {
        type: 'object',
        properties: {
          additionalVerbs: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingVerb: 'Controller "{{name}}" should start with an action verb (e.g., Find, Create, Update).',
    },
  },
  defaultOptions: [{ additionalVerbs: [] as string[] }],
  create(context, [options]) {
    const verbs = new Set<string>([...KNOWN_VERBS, ...options.additionalVerbs])
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          const name = cls.id?.name
          if (name === undefined || !name.endsWith('Controller')) continue
          const startsWithVerb = [...verbs].some((v) => name.startsWith(v))
          if (!startsWithVerb) {
            context.report({ node: cls, messageId: 'missingVerb', data: { name } })
          }
        }
      },
    }
  },
})
