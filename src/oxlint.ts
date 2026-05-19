import { fileURLToPath } from 'node:url'

export const oxlintBaseConfigPath = fileURLToPath(new URL('./oxlintrc.base.json', import.meta.url))
