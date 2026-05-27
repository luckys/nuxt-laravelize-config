export type TemplateVars = Readonly<Record<string, string | number | boolean | undefined>>

const TOKEN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\|\s*([a-z]+))?\s*\}\}/g

export function render(template: string, vars: TemplateVars): string {
  return template.replace(TOKEN, (_match, key: string, filter: string | undefined) => {
    const raw = vars[key]
    if (raw === undefined) throw new Error(`Missing template variable: ${key}`)
    const str = String(raw)
    if (filter === undefined) return str
    if (filter === 'camel') return toCamelCase(str)
    if (filter === 'pascal') return toPascalCase(str)
    if (filter === 'kebab') return toKebabCase(str)
    if (filter === 'lower') return str.toLowerCase()
    if (filter === 'upper') return str.toUpperCase()
    throw new Error(`Unknown filter: ${filter}`)
  })
}

export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

export function toPascalCase(input: string): string {
  return input
    .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase())
}

export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}
