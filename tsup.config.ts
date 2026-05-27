import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const here = dirname(fileURLToPath(import.meta.url))
const presetsDir = resolve(here, 'src/presets')
const distDir = resolve(here, 'dist')

const presetAssets = ['dprint.base.json', 'oxlintrc.base.json', 'tsconfig.base.json', 'lefthook.base.yml']

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'eslint': 'src/presets/eslint.ts',
    'vitest': 'src/presets/vitest.ts',
    'tsconfig': 'src/presets/tsconfig.ts',
    'oxlint': 'src/presets/oxlint.ts',
    'dprint': 'src/presets/dprint.ts',
    'lefthook': 'src/presets/lefthook.ts',
    'cli/bin': 'src/cli/bin.ts',
    'postinstall/index': 'src/postinstall/index.ts',
    'eslint-plugin/index': 'src/eslint-plugin/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'node20',
  outDir: 'dist',
  shims: true,
  splitting: false,
  external: [
    'vitest',
    'vitest/config',
    'vite',
    'eslint',
    '@eslint/js',
    '@typescript-eslint/utils',
    '@typescript-eslint/rule-tester',
    'citty',
    'ejs',
  ],
  async onSuccess() {
    if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
    for (const asset of presetAssets) {
      const from = join(presetsDir, asset)
      const to = join(distDir, asset)
      if (existsSync(from)) cpSync(from, to)
    }
    const skillsSrc = resolve(here, 'src/skills')
    if (existsSync(skillsSrc)) {
      const entries = readdirSync(skillsSrc, { withFileTypes: true })
      if (entries.some((e) => e.isDirectory())) {
        cpSync(skillsSrc, join(distDir, 'skills'), { recursive: true })
      }
    }
    const templatesSrc = resolve(here, 'src/cli/templates')
    if (existsSync(templatesSrc)) {
      cpSync(templatesSrc, join(distDir, 'cli/templates'), { recursive: true })
    }
    const binPath = join(distDir, 'cli/bin.js')
    if (existsSync(binPath)) chmodSync(binPath, 0o755)
  },
})
