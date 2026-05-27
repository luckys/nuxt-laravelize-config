import type { TSESTree } from '@typescript-eslint/utils'

export function getExportedClasses(program: TSESTree.Program): TSESTree.ClassDeclaration[] {
  const classes: TSESTree.ClassDeclaration[] = []
  for (const node of program.body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'ClassDeclaration') {
      classes.push(node.declaration)
    } else if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ClassDeclaration') {
      classes.push(node.declaration)
    } else if (node.type === 'ClassDeclaration') {
      classes.push(node)
    }
  }
  return classes
}

export function getPublicMethods(node: TSESTree.ClassDeclaration): TSESTree.MethodDefinition[] {
  const methods: TSESTree.MethodDefinition[] = []
  for (const member of node.body.body) {
    if (member.type !== 'MethodDefinition') continue
    if (member.kind !== 'method') continue
    if (member.accessibility === 'private' || member.accessibility === 'protected') continue
    if (member.key.type === 'PrivateIdentifier') continue
    methods.push(member)
  }
  return methods
}

export function getMethodName(method: TSESTree.MethodDefinition): string | null {
  if (method.key.type === 'Identifier') return method.key.name
  if (method.key.type === 'Literal' && typeof method.key.value === 'string') return method.key.value
  return null
}

export function classHasMethod(node: TSESTree.ClassDeclaration, name: string): boolean {
  return node.body.body.some((m) => m.type === 'MethodDefinition' && getMethodName(m) === name)
}

export function getInterfaceDeclarations(program: TSESTree.Program): TSESTree.TSInterfaceDeclaration[] {
  const interfaces: TSESTree.TSInterfaceDeclaration[] = []
  for (const node of program.body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'TSInterfaceDeclaration') {
      interfaces.push(node.declaration)
    } else if (node.type === 'TSInterfaceDeclaration') {
      interfaces.push(node)
    }
  }
  return interfaces
}

export function countInstanceProperties(node: TSESTree.ClassDeclaration): number {
  let count = 0
  for (const member of node.body.body) {
    if (member.type === 'PropertyDefinition' && member.static !== true) count += 1
    if (member.type === 'TSAbstractPropertyDefinition' && member.static !== true) count += 1
  }
  const ctor = node.body.body.find(
    (m): m is TSESTree.MethodDefinition => m.type === 'MethodDefinition' && m.kind === 'constructor',
  )
  if (ctor !== undefined) {
    for (const param of ctor.value.params) {
      if (param.type === 'TSParameterProperty') count += 1
    }
  }
  return count
}
