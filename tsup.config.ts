import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    eslint: 'src/eslint.ts',
    vitest: 'src/vitest.ts',
    tsconfig: 'src/tsconfig.ts',
    oxlint: 'src/oxlint.ts',
    dprint: 'src/dprint.ts',
    lefthook: 'src/lefthook.ts',
    'postinstall/index': 'src/postinstall/index.ts',
    'eslint-plugin/index': 'src/eslint-plugin/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  external: ['@luckys_luis/nuxt-ddd-toolkit'],
})
