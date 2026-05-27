export type Layer = 'domain' | 'application' | 'infrastructure' | 'presentation'

export interface LayerInfo {
  readonly layer: Layer
  readonly context: string
  readonly module: string | null
}

const PATTERN = /\/contexts\/([^/]+)\/(?:([^/]+)\/)?(domain|application|infrastructure|presentation)\//

export function classifyPath(filename: string): LayerInfo | null {
  const normalised = filename.replace(/\\/g, '/')
  const match = normalised.match(PATTERN)
  if (match === null) return null
  return {
    context: match[1]!,
    module: match[2] ?? null,
    layer: match[3] as Layer,
  }
}

export function isInLayer(filename: string, layer: Layer): boolean {
  return classifyPath(filename)?.layer === layer
}

export function resolveImportLayer(
  fromFile: string,
  importPath: string,
): Layer | null {
  if (importPath.startsWith('.')) {
    const absolute = combinePosix(fromFile, importPath)
    return classifyPath(absolute)?.layer ?? null
  }
  const aliasMatch = importPath.match(/(?:^|[~@/])contexts\/[^/]+(?:\/[^/]+)?\/(domain|application|infrastructure|presentation)(?:\/|$)/)
  if (aliasMatch !== null) return aliasMatch[1] as Layer
  return null
}

function combinePosix(fromFile: string, relative: string): string {
  const dir = fromFile.replace(/\\/g, '/').replace(/\/[^/]+$/, '')
  const segments = `${dir}/${relative}`.split('/')
  const stack: string[] = []
  for (const segment of segments) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') stack.pop()
    else stack.push(segment)
  }
  return `/${stack.join('/')}`
}
