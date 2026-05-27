---
name: create-aggregate
description: Use this skill to create an Aggregate Root in a nuxt-laravelize project. Enforces CodelyTV rules — flat domain folder, ≤4 instance properties, toPrimitives/fromPrimitives serialisation, invariants as domain errors.
---

# Create Aggregate

An Aggregate Root is the consistency boundary of the domain. Lives in `server/contexts/<context>/<module>/domain/` (flat — no subfolder).

## Preferred: CLI

```bash
laravelize new:aggregate <Name> --context=<c> --module=<m>
# example
laravelize new:aggregate Invoice --context=billing --module=invoicing
```

## Hand-written template

`server/contexts/billing/invoicing/domain/Invoice.ts`:

```ts
import { InvoiceId } from './InvoiceId'
import { InvoiceAmount } from './InvoiceAmount'
import { InvoiceStatus } from './InvoiceStatus'
import { InvoiceCustomerId } from './InvoiceCustomerId'

interface InvoicePrimitives {
  id: string
  customerId: string
  amount: number
  status: string
}

export class Invoice {
  constructor(
    private readonly id: InvoiceId,
    private readonly customerId: InvoiceCustomerId,
    private readonly amount: InvoiceAmount,
    private readonly status: InvoiceStatus,
  ) {}

  static create(id: InvoiceId, customerId: InvoiceCustomerId, amount: InvoiceAmount): Invoice {
    return new Invoice(id, customerId, amount, InvoiceStatus.draft())
  }

  toPrimitives(): InvoicePrimitives {
    return {
      id: this.id.value,
      customerId: this.customerId.value,
      amount: this.amount.value,
      status: this.status.value,
    }
  }

  static fromPrimitives(p: InvoicePrimitives): Invoice {
    return new Invoice(
      new InvoiceId(p.id),
      new InvoiceCustomerId(p.customerId),
      new InvoiceAmount(p.amount),
      new InvoiceStatus(p.status),
    )
  }
}
```

## Rules (hard)

- **Max 4 instance properties.** If you need 5, extract a Value Object or split the aggregate. The `ddd/aggregate-max-props` lint catches this.
- **Properties are `private readonly`.** No public setters. Mutations return a new instance.
- **`toPrimitives()` + static `fromPrimitives()` are mandatory.** They are the marker the lint uses to recognise an aggregate.
- **Invariants belong here.** Any business rule that must always hold (`amount > 0`, `status transitions`) → enforced in the aggregate's methods, raising domain errors.
- **No infrastructure imports.** No `drizzle`, no `fetch`, no `h3`. The `ddd/no-infrastructure-from-domain` lint catches this.

## Companion files

Each aggregate ships with:
- Its `*Id` Value Object → `create-value-object` skill.
- Other VOs for primitives wrapped (use `create-value-object`).
- A repository interface → `create-repository` skill.

## Tests

Place in `tests/contexts/<context>/<module>/domain/<Aggregate>.test.ts`. Use an Object Mother → `write-use-case-test-with-object-mother`.
