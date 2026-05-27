import type { TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { getInterfaceDeclarations } from '../utils/astHelpers'

export const repositoryNoThrow = createRule({
  name: 'repository-no-throw',
  meta: {
    type: 'problem',
    docs: { description: 'Repository interfaces must not declare throw or return Promise<never>.' },
    schema: [],
    messages: {
      noNever: 'Repository method "{{name}}" must not return Promise<never>. Return null, empty array, or a Result instead.',
      noJsdocThrows: 'Repository methods must not document @throws.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        for (const iface of getInterfaceDeclarations(program)) {
          if (!iface.id.name.endsWith('Repository')) continue
          for (const member of iface.body.body) {
            if (member.type !== 'TSMethodSignature' && member.type !== 'TSPropertySignature') continue
            const name = methodName(member)
            if (name === null) continue
            if (returnsPromiseNever(member)) {
              context.report({ node: member, messageId: 'noNever', data: { name } })
            }
            const comments = context.sourceCode.getCommentsBefore(member)
            if (comments.some((c) => /@throws/.test(c.value))) {
              context.report({ node: member, messageId: 'noJsdocThrows' })
            }
          }
        }
      },
    }
  },
})

function methodName(member: TSESTree.TSMethodSignature | TSESTree.TSPropertySignature): string | null {
  if (member.key.type === 'Identifier') return member.key.name
  return null
}

function returnsPromiseNever(member: TSESTree.TSMethodSignature | TSESTree.TSPropertySignature): boolean {
  const ret = member.type === 'TSMethodSignature' ? member.returnType : member.typeAnnotation
  if (ret === undefined) return false
  const type = ret.typeAnnotation
  if (type.type !== 'TSTypeReference') return false
  if (type.typeName.type !== 'Identifier' || type.typeName.name !== 'Promise') return false
  const arg = type.typeArguments?.params[0]
  return arg?.type === 'TSNeverKeyword'
}
