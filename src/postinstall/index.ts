import { linkSkills } from './linkSkills'

const SKIP_ENV = 'LARAVELIZE_SKIP_POSTINSTALL'

export { linkSkills } from './linkSkills'
export { unlinkSkills } from './unlinkSkills'
export { skillsStatus } from './status'
export { detectTargets } from './linkSkills'

export function runPostinstall(projectRoot: string | undefined = process.env.INIT_CWD): void {
  if (process.env[SKIP_ENV] === '1') return
  if (projectRoot === undefined || projectRoot === '') return
  if (projectRoot === process.cwd()) return

  const logger = (line: string) => process.stdout.write(`nuxt-laravelize-config: ${line}\n`)

  try {
    linkSkills({ projectRoot, logger })
  } catch (error) {
    process.stderr.write(`nuxt-laravelize-config postinstall failed: ${(error as Error).message}\n`)
  }
}

const isDirectInvocation = (() => {
  if (typeof process === 'undefined') return false
  const argv1 = process.argv[1]
  if (argv1 === undefined) return false
  return argv1.endsWith('postinstall/index.js') || argv1.endsWith('postinstall.js') || argv1.endsWith('postinstall.mjs')
})()

if (isDirectInvocation) runPostinstall()
