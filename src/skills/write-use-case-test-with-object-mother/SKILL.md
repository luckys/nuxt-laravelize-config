---
name: write-use-case-test-with-object-mother
description: Use this skill to write a Vitest unit test for a use case in a nuxt-laravelize project. Test uses Object Mothers (random valid aggregates) and in-memory repositories — NOT mocks. Follows TDD red-green-refactor.
---

# Write Use Case Test (Object Mother)

Tests live in `tests/contexts/<context>/<module>/...` mirroring the source layout. One test per use case.

## TDD order

1. Write the test first. Run it → red.
2. Implement the use case minimally → green.
3. Refactor. Repeat.

## Object Mother

An Object Mother is a static factory of valid domain instances for tests. Lives in `tests/contexts/<context>/<module>/domain/<Aggregate>Mother.ts`.

```ts
// tests/contexts/billing/invoicing/domain/InvoiceMother.ts
import { Invoice } from '~/server/contexts/billing/invoicing/domain/Invoice'
import { InvoiceId } from '~/server/contexts/billing/invoicing/domain/InvoiceId'
import { InvoiceCustomerId } from '~/server/contexts/billing/invoicing/domain/InvoiceCustomerId'
import { InvoiceAmount } from '~/server/contexts/billing/invoicing/domain/InvoiceAmount'

export class InvoiceMother {
  static create(overrides: { id?: string; customerId?: string; amount?: number } = {}): Invoice {
    return Invoice.create(
      new InvoiceId(overrides.id ?? '01900000-0000-7000-8000-000000000000'),
      new InvoiceCustomerId(overrides.customerId ?? '01900000-0000-7000-8000-000000000001'),
      new InvoiceAmount(overrides.amount ?? 100),
    )
  }

  static withAmount(amount: number): Invoice {
    return InvoiceMother.create({ amount })
  }
}
```

## Use case test

```ts
// tests/contexts/billing/invoicing/application/InvoiceCreator/InvoiceCreator.test.ts
import { describe, it, expect } from 'vitest'
import { InvoiceCreator } from '~/server/contexts/billing/invoicing/application/InvoiceCreator/InvoiceCreator'
import { InMemoryInvoiceRepository } from '~/server/contexts/billing/invoicing/infrastructure/InMemoryInvoiceRepository'
import { FakeDispatcher } from '@luckys_luis/nuxt-laravelize/testing'
import { InvoiceCreated } from '~/server/contexts/billing/invoicing/domain/InvoiceCreated'
import { InvoiceMother } from '../../domain/InvoiceMother'

describe('InvoiceCreator', () => {
  it('persists the invoice and dispatches InvoiceCreated', async () => {
    const repo = new InMemoryInvoiceRepository()
    const events = new FakeDispatcher()
    const useCase = new InvoiceCreator(repo, events)

    const invoice = InvoiceMother.withAmount(500)
    const p = invoice.toPrimitives()

    await useCase.execute({ id: p.id, customerId: p.customerId, amount: p.amount })

    expect(await repo.count({} as never)).toBe(1)
    events.assertDispatched(InvoiceCreated, (e) => e.amount === 500)
  })

  it('rejects negative amounts', async () => {
    const repo = new InMemoryInvoiceRepository()
    const events = new FakeDispatcher()
    const useCase = new InvoiceCreator(repo, events)

    await expect(useCase.execute({ id: 'x', customerId: 'y', amount: -1 }))
      .rejects.toThrow(/InvoiceAmount/i)
    expect(await repo.count({} as never)).toBe(0)
    events.assertNothingDispatched()
  })
})
```

## Rules

- One test per use case, mirroring `application/` layout.
- Use **in-memory repos** (`InMemory<Aggregate>Repository`), not mocks. Mocks divorce tests from real persistence semantics.
- Use **fakes from `@luckys_luis/nuxt-laravelize/testing`** for `Dispatcher`, `Queue`, `Mailer`, `NotificationManager`, `Logger`. These come with `assertDispatched`, `assertQueued`, `assertMailed`, etc.
- Object Mothers ONLY in `tests/`. Domain folder must remain test-free.
- Each test asserts a single behaviour. Pair a happy-path with one or two failure invariants.
- NEVER hit the real database in unit tests. Integration tests live in `tests/integration/` and bring up a real DB through `mountLaravelize({ realDb: true })`.

## Anti-patterns

- ❌ Mocking the repository with `vi.fn()` — use in-memory.
- ❌ Reaching into private fields with `(obj as any).#value` — assert via `toPrimitives()`.
- ❌ Writing the test after the use case.
- ❌ One Object Mother method per call-site — keep a small set of named builders (`create`, `withX`, `paid`, `draft`).
