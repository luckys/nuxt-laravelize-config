import { readFileSync } from 'node:fs'

const DEFAULT_GLOBS = ['server/contexts/**/*.ts', 'app/contexts/**/*.ts', 'tests/**/*.ts']

export function convertSkillMdToCursorMdc(skillMdPath: string): string {
  const source = readFileSync(skillMdPath, 'utf8')
  const { frontmatter, body } = splitFrontmatter(source)
  const description = (frontmatter.match(/^description:\s*(.+)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
  const globs = DEFAULT_GLOBS

  const header = [
    '---',
    `description: ${description}`,
    `globs: ${JSON.stringify(globs)}`,
    'alwaysApply: false',
    '---',
    '',
  ].join('\n')

  return `${header}${body.trimStart()}`
}

function splitFrontmatter(source: string): { frontmatter: string; body: string } {
  if (!source.startsWith('---\n')) return { frontmatter: '', body: source }
  const end = source.indexOf('\n---\n', 4)
  if (end === -1) return { frontmatter: '', body: source }
  return {
    frontmatter: source.slice(4, end),
    body: source.slice(end + 5),
  }
}
