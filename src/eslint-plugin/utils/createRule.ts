import { ESLintUtils } from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/luckys-luis/nuxt-laravelize/blob/main/docs/lint/${name}.md`,
)
