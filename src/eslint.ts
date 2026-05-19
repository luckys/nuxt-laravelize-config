type EslintPreset = 'recommended' | 'strict'

type EslintOptions = {
  preset?: EslintPreset
}

export const eslintBaseConfig = [
  {
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  {
    rules: {
      'no-console': 'error',
    },
  },
] as const

export function defineNuxtLaravelizeEslintConfig(options: EslintOptions = {}) {
  if (options.preset === 'strict') {
    return [
      ...eslintBaseConfig,
      {
        rules: {
          'no-else-return': 'error',
          'max-depth': ['error', 1],
        },
      },
    ]
  }

  return [...eslintBaseConfig]
}
