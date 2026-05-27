import { aggregateMaxProps } from './rules/aggregate-max-props'
import { controllerNaming } from './rules/controller-naming'
import { controllerSingleAction } from './rules/controller-single-action'
import { domainFlat } from './rules/domain-flat'
import { noApplicationFromDomain } from './rules/no-application-from-domain'
import { noInfrastructureFromDomain } from './rules/no-infrastructure-from-domain'
import { repositoryNoThrow } from './rules/repository-no-throw'
import { repositoryRequiredMethods } from './rules/repository-required-methods'
import { useCaseMethodExecute } from './rules/use-case-method-execute'
import { useCaseNaming } from './rules/use-case-naming'
import { valueObjectNoThrowInConstructor } from './rules/value-object-no-throw-in-constructor'
import { valueObjectPrivateValue } from './rules/value-object-private-value'

import { recommendedRules } from './configs/recommended'
import { strictRules } from './configs/strict'

export const rules = {
  'aggregate-max-props': aggregateMaxProps,
  'controller-naming': controllerNaming,
  'controller-single-action': controllerSingleAction,
  'domain-flat': domainFlat,
  'no-application-from-domain': noApplicationFromDomain,
  'no-infrastructure-from-domain': noInfrastructureFromDomain,
  'repository-no-throw': repositoryNoThrow,
  'repository-required-methods': repositoryRequiredMethods,
  'use-case-method-execute': useCaseMethodExecute,
  'use-case-naming': useCaseNaming,
  'value-object-no-throw-in-constructor': valueObjectNoThrowInConstructor,
  'value-object-private-value': valueObjectPrivateValue,
}

const plugin = {
  meta: { name: 'nuxt-laravelize-ddd', version: '0.1.0' },
  rules,
}

export const configs = {
  recommended: {
    name: 'nuxt-laravelize/ddd/recommended',
    plugins: { ddd: plugin },
    rules: recommendedRules,
  },
  strict: {
    name: 'nuxt-laravelize/ddd/strict',
    plugins: { ddd: plugin },
    rules: strictRules,
  },
}

export default { ...plugin, configs }
export { plugin }
