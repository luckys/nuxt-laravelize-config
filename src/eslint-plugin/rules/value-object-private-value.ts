import type { TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { isInLayer } from '../utils/pathClassifier'
import { getExportedClasses } from '../utils/astHelpers'

const VO_SUFFIXES = ['Id', 'Name', 'Email', 'Amount', 'Status', 'Count', 'Date', 'Address']

export const valueObjectPrivateValue = createRule({
  name: 'value-object-private-value',
  meta: {
    type: 'problem',
    docs: { description: 'Value Objects expose readonly state via a private #value field, never a public property or setter.' },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      publicValueField: 'Value Object "{{name}}" must not expose a public "value" field. Use private #value with a getter.',
      publicSetter: 'Value Object "{{name}}" must not expose setters.',
    },
  },
  defaultOptions: [{ suffixes: VO_SUFFIXES }],
  create(context, [options]) {
    if (!isInLayer(context.filename, 'domain')) return {}
    const suffixes = options.suffixes ?? VO_SUFFIXES
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          const name = cls.id?.name
          if (name === undefined) continue
          if (!suffixes.some((s) => name.endsWith(s))) continue
          for (const member of cls.body.body) {
            if (isPublicValueProperty(member)) {
              context.report({ node: member, messageId: 'publicValueField', data: { name } })
            }
            if (member.type === 'MethodDefinition' && member.kind === 'set') {
              context.report({ node: member, messageId: 'publicSetter', data: { name } })
            }
          }
        }
      },
    }
  },
})

function isPublicValueProperty(member: TSESTree.ClassElement): boolean {
  if (member.type !== 'PropertyDefinition') return false
  if (member.accessibility === 'private' || member.accessibility === 'protected') return false
  if (member.key.type === 'PrivateIdentifier') return false
  if (member.key.type !== 'Identifier' || member.key.name !== 'value') return false
  return true
}
