import type { TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { isInLayer } from '../utils/pathClassifier'
import { getExportedClasses } from '../utils/astHelpers'

export const valueObjectNoThrowInConstructor = createRule({
  name: 'value-object-no-throw-in-constructor',
  meta: {
    type: 'problem',
    docs: { description: 'Value Object constructors delegate validation to private #ensure* methods; no inline throw.' },
    schema: [],
    messages: {
      inlineThrow: 'Value Object constructor must not throw inline. Extract to a private #ensure* method called from the constructor.',
    },
  },
  defaultOptions: [],
  create(context) {
    if (!isInLayer(context.filename, 'domain')) return {}
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          const ctor = findConstructor(cls)
          if (ctor === undefined) continue
          for (const stmt of ctor.body?.body ?? []) {
            walk(stmt, (node) => {
              if (node.type === 'ThrowStatement') {
                context.report({ node, messageId: 'inlineThrow' })
              }
            })
          }
        }
      },
    }
  },
})

function findConstructor(cls: TSESTree.ClassDeclaration): TSESTree.FunctionExpression | undefined {
  for (const member of cls.body.body) {
    if (member.type !== 'MethodDefinition' || member.kind !== 'constructor') continue
    if (member.value.type === 'FunctionExpression') return member.value
  }
  return undefined
}

function walk(node: unknown, visit: (n: TSESTree.Node) => void): void {
  if (node === null || typeof node !== 'object') return
  if ('type' in node) visit(node as TSESTree.Node)
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'parent') continue
    if (Array.isArray(value)) {
      for (const item of value) walk(item, visit)
    } else if (value !== null && typeof value === 'object') {
      walk(value, visit)
    }
  }
}
