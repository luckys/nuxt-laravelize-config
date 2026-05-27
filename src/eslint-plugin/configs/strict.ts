import { recommendedRules } from './recommended'

export const strictRules = {
  ...recommendedRules,
  'ddd/controller-naming': 'error',
  'ddd/aggregate-max-props': 'error',
  'ddd/value-object-private-value': 'error',
  'ddd/value-object-no-throw-in-constructor': 'error',
} as const
