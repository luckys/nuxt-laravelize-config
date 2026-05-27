import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    rules: {
      'no-console': 'error',
      'no-else-return': 'error',
      'max-depth': ['error', 1],
    },
  },
]
