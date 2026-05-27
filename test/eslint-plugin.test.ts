import { RuleTester } from '@typescript-eslint/rule-tester'
import { afterAll, describe, it } from 'vitest'

import { noInfrastructureFromDomain } from '../src/eslint-plugin/rules/no-infrastructure-from-domain'
import { noApplicationFromDomain } from '../src/eslint-plugin/rules/no-application-from-domain'
import { domainFlat } from '../src/eslint-plugin/rules/domain-flat'
import { useCaseNaming } from '../src/eslint-plugin/rules/use-case-naming'
import { useCaseMethodExecute } from '../src/eslint-plugin/rules/use-case-method-execute'
import { controllerSingleAction } from '../src/eslint-plugin/rules/controller-single-action'
import { controllerNaming } from '../src/eslint-plugin/rules/controller-naming'
import { repositoryNoThrow } from '../src/eslint-plugin/rules/repository-no-throw'
import { repositoryRequiredMethods } from '../src/eslint-plugin/rules/repository-required-methods'
import { valueObjectPrivateValue } from '../src/eslint-plugin/rules/value-object-private-value'
import { valueObjectNoThrowInConstructor } from '../src/eslint-plugin/rules/value-object-no-throw-in-constructor'
import { aggregateMaxProps } from '../src/eslint-plugin/rules/aggregate-max-props'

RuleTester.afterAll = afterAll
RuleTester.it = it
RuleTester.itOnly = it.only
RuleTester.describe = describe

const ruleTester = new RuleTester()

const DOMAIN = '/repo/server/contexts/billing/invoicing/domain/Invoice.ts'
const DOMAIN_VO = '/repo/server/contexts/billing/invoicing/domain/InvoiceAmount.ts'
const DOMAIN_REPO = '/repo/server/contexts/billing/invoicing/domain/InvoiceRepository.ts'
const APP_UC = '/repo/server/contexts/billing/invoicing/application/InvoiceCreator/InvoiceCreator.ts'
const APP_OTHER = '/repo/server/contexts/billing/invoicing/application/Other/Other.ts'
const CONTROLLER = '/repo/server/controllers/CreateInvoiceController.ts'

ruleTester.run('no-infrastructure-from-domain', noInfrastructureFromDomain, {
  valid: [
    { code: `import { Invoice } from './Invoice'`, filename: DOMAIN },
    { code: `import { DrizzleRepo } from '../infrastructure/Repo'`, filename: APP_OTHER },
  ],
  invalid: [
    {
      code: `import { DrizzleRepo } from '../infrastructure/DrizzleRepo'`,
      filename: DOMAIN,
      errors: [{ messageId: 'forbidden' }],
    },
  ],
})

ruleTester.run('no-application-from-domain', noApplicationFromDomain, {
  valid: [
    { code: `import { Invoice } from './Invoice'`, filename: DOMAIN },
  ],
  invalid: [
    {
      code: `import { InvoiceCreator } from '../application/InvoiceCreator/InvoiceCreator'`,
      filename: DOMAIN,
      errors: [{ messageId: 'forbidden' }],
    },
  ],
})

ruleTester.run('domain-flat', domainFlat, {
  valid: [
    { code: `export const x = 1`, filename: DOMAIN },
  ],
  invalid: [
    {
      code: `export const x = 1`,
      filename: '/repo/server/contexts/billing/invoicing/domain/value-objects/Email.ts',
      errors: [{ messageId: 'noSubfolder' }],
    },
  ],
})

ruleTester.run('use-case-naming', useCaseNaming, {
  valid: [
    { code: `export class InvoiceCreator { execute() {} }`, filename: APP_UC },
    { code: `export class UserFinder { execute() {} }`, filename: APP_UC },
  ],
  invalid: [
    {
      code: `export class CreateInvoice { execute() {} }`,
      filename: APP_UC,
      errors: [{ messageId: 'badName' }],
    },
  ],
})

ruleTester.run('use-case-method-execute', useCaseMethodExecute, {
  valid: [
    { code: `export class InvoiceCreator { execute() {} }`, filename: APP_UC },
    { code: `export class InvoiceCreator { execute() {} private helper() {} }`, filename: APP_UC },
  ],
  invalid: [
    {
      code: `export class InvoiceCreator { run() {} }`,
      filename: APP_UC,
      errors: [{ messageId: 'wrongName' }],
    },
    {
      code: `export class InvoiceCreator { execute() {} other() {} }`,
      filename: APP_UC,
      errors: [{ messageId: 'tooManyMethods' }],
    },
    {
      code: `export class InvoiceCreator { }`,
      filename: APP_UC,
      errors: [{ messageId: 'missingExecute' }],
    },
  ],
})

ruleTester.run('controller-single-action', controllerSingleAction, {
  valid: [
    { code: `export class FindUserController { invoke() {} }`, filename: CONTROLLER },
    { code: `export class FindUserController { invoke() {} private util() {} }`, filename: CONTROLLER },
  ],
  invalid: [
    {
      code: `export class UserController { index() {} store() {} }`,
      filename: CONTROLLER,
      errors: [{ messageId: 'tooManyMethods' }],
    },
    {
      code: `export class FindUserController { handle() {} }`,
      filename: CONTROLLER,
      errors: [{ messageId: 'wrongName' }],
    },
  ],
})

ruleTester.run('controller-naming', controllerNaming, {
  valid: [
    { code: `export class FindUserController { invoke() {} }`, filename: CONTROLLER },
    { code: `export class CreateInvoiceController { invoke() {} }`, filename: CONTROLLER },
  ],
  invalid: [
    {
      code: `export class UserController { invoke() {} }`,
      filename: CONTROLLER,
      errors: [{ messageId: 'missingVerb' }],
    },
  ],
})

ruleTester.run('repository-no-throw', repositoryNoThrow, {
  valid: [
    {
      code: `
export interface InvoiceRepository {
  save(): Promise<void>
  find(id: string): Promise<Invoice | null>
}
type Invoice = { id: string }
      `,
      filename: DOMAIN_REPO,
    },
  ],
  invalid: [
    {
      code: `
export interface InvoiceRepository {
  find(id: string): Promise<never>
}
      `,
      filename: DOMAIN_REPO,
      errors: [{ messageId: 'noNever' }],
    },
  ],
})

ruleTester.run('repository-required-methods', repositoryRequiredMethods, {
  valid: [
    {
      code: `
export interface InvoiceRepository {
  save(): Promise<void>
  find(id: string): Promise<unknown>
  search(criteria: unknown): Promise<readonly unknown[]>
  searchPaginated(criteria: unknown, page: number, perPage: number): Promise<unknown>
  count(criteria: unknown): Promise<number>
}
      `,
      filename: DOMAIN_REPO,
    },
  ],
  invalid: [
    {
      code: `
export interface InvoiceRepository {
  save(): Promise<void>
  find(id: string): Promise<unknown>
}
      `,
      filename: DOMAIN_REPO,
      errors: [
        { messageId: 'missingMethod' },
        { messageId: 'missingMethod' },
        { messageId: 'missingMethod' },
      ],
    },
  ],
})

ruleTester.run('value-object-private-value', valueObjectPrivateValue, {
  valid: [
    {
      code: `
export class InvoiceId {
  readonly #value: string
  constructor(value: string) { this.#value = value }
  get value(): string { return this.#value }
}
      `,
      filename: DOMAIN_VO,
    },
  ],
  invalid: [
    {
      code: `
export class InvoiceId {
  public value: string
  constructor(value: string) { this.value = value }
}
      `,
      filename: DOMAIN_VO,
      errors: [{ messageId: 'publicValueField' }],
    },
    {
      code: `
export class InvoiceId {
  readonly #value: string
  constructor(value: string) { this.#value = value }
  get value(): string { return this.#value }
  set value(v: string) { /* noop */ }
}
      `,
      filename: DOMAIN_VO,
      errors: [{ messageId: 'publicSetter' }],
    },
  ],
})

ruleTester.run('value-object-no-throw-in-constructor', valueObjectNoThrowInConstructor, {
  valid: [
    {
      code: `
export class InvoiceAmount {
  readonly #value: number
  constructor(value: number) {
    this.#ensureNonNegative(value)
    this.#value = value
  }
  #ensureNonNegative(v: number) { if (v < 0) throw new Error('bad') }
}
      `,
      filename: DOMAIN_VO,
    },
  ],
  invalid: [
    {
      code: `
export class InvoiceAmount {
  readonly #value: number
  constructor(value: number) {
    if (value < 0) throw new Error('bad')
    this.#value = value
  }
}
      `,
      filename: DOMAIN_VO,
      errors: [{ messageId: 'inlineThrow' }],
    },
  ],
})

ruleTester.run('aggregate-max-props', aggregateMaxProps, {
  valid: [
    {
      code: `
export class Invoice {
  constructor(private readonly id: string, private readonly customer: string, private readonly amount: number) {}
  toPrimitives() { return {} }
}
      `,
      filename: DOMAIN,
    },
    {
      code: `
export class WithoutMarker {
  constructor(public a: string, public b: string, public c: string, public d: string, public e: string) {}
}
      `,
      filename: DOMAIN,
    },
  ],
  invalid: [
    {
      code: `
export class Invoice {
  constructor(
    private readonly id: string,
    private readonly customer: string,
    private readonly amount: number,
    private readonly status: string,
    private readonly extra: string,
  ) {}
  toPrimitives() { return {} }
}
      `,
      filename: DOMAIN,
      errors: [{ messageId: 'tooMany' }],
    },
  ],
})
