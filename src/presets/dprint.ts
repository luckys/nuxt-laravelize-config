import { fileURLToPath } from 'node:url'

export const dprintBaseConfigPath = fileURLToPath(new URL('./dprint.base.json', import.meta.url))
