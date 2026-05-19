import { describe, expect, it } from 'vitest'

import {
  dprintBaseConfigPath,
  eslintBaseConfig,
  lefthookBaseConfigPath,
  oxlintBaseConfigPath,
  tsconfigBasePath,
  vitestBaseConfig,
} from '../src'

describe('@luckys_luis/nuxt-laravelize-config', () => {
  it('exports non-empty defaults', () => {
    expect(eslintBaseConfig.length).toBeGreaterThan(0)
    expect(vitestBaseConfig.test?.environment).toBe('node')
    expect(tsconfigBasePath).toContain('tsconfig.base.json')
    expect(oxlintBaseConfigPath).toContain('oxlintrc.base.json')
    expect(dprintBaseConfigPath).toContain('dprint.base.json')
    expect(lefthookBaseConfigPath).toContain('lefthook.base.yml')
  })
})
