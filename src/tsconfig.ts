import { fileURLToPath } from 'node:url'

export const tsconfigBasePath = fileURLToPath(new URL('./tsconfig.base.json', import.meta.url))
