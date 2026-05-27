---
name: create-factory
description: Use this skill to create a Factory in a nuxt-laravelize project. Factories generate aggregates with sensible defaults for tests and seeders, support state composition, count(n), make() and create(persister) — Laravel/Eloquent-style.
---

# Create Factory

A `Factory<T>` produces aggregates (or their primitive payloads) with sensible defaults. Used by **seeders** and **Object Mothers**.

## Preferred: CLI

```bash
laravelize new:factory <Aggregate> --context=<c> --module=<m>
# example
laravelize new:factory Invoice --context=billing --module=invoicing
```

## Template

```ts
// server/database/factories/InvoiceFactory.ts
import { Factory } from '@luckys_luis/nuxt-laravelize'
import { Invoice } from '~/server/contexts/billing/invoicing/domain/Invoice'
import { InvoiceId } from '~/server/contexts/billing/invoicing/domain/InvoiceId'
import { InvoiceCustomerId } from '~/server/contexts/billing/invoicing/domain/InvoiceCustomerId'
import { InvoiceAmount } from '~/server/contexts/billing/invoicing/domain/InvoiceAmount'

interface InvoiceShape {
  id: string
  customerId: string
  amount: number
}

export class InvoiceFactory extends Factory<Invoice> {
  protected definition(): Invoice {
    return Invoice.create(
      new InvoiceId(this.faker.string.uuid()),
      new InvoiceCustomerId(this.faker.string.uuid()),
      new InvoiceAmount(this.faker.number.int({ min: 100, max: 100000 })),
    )
  }

  paid(): this {
    return this.state((draft) => {
      // any mutation/override; only applied at make() time
      // since aggregate is immutable, prefer building a fresh one in definition variants
      return draft
    })
  }
}
```

## API

```ts
factory.make()                          // 1 aggregate, default
factory.count(50).make()                // array of 50
factory.state({ amount: 999 }).make()   // override via partial
factory.state(d => withPaidStatus(d)).count(10).make()  // computed override

// persist via callback (so factory is repo-agnostic)
await factory.count(20).create(async (inv) => repo.save(inv))
```

## Rules

- One factory per aggregate, in `server/database/factories/`. Class name `{Aggregate}Factory`.
- `definition()` is **abstract** — implement it to return one default-shaped aggregate.
- `state()` composes — chain multiple times before `make()` / `create()`.
- `faker` is the optional `@faker-js/faker` peer; if not installed, fall back to a tiny built-in shim provided by `@luckys_luis/nuxt-laravelize` for ids/strings only.
- Factories produce **valid** aggregates — defaults respect all invariants (no negative amounts, etc.).
- NEVER persist from inside `definition()` or `state()`. Persistence is the caller's job (or `create(persister)`).

## Pairing

- Inside **seeders**: bulk-generate sample data (`factory.count(N).create(repo.save)`).
- Inside **Object Mothers**: shorthand builders for tests. See `write-use-case-test-with-object-mother`.

## Registration (optional)

If a seeder or use-case wants to resolve the factory via DI:

```ts
this.container.transient(invoiceFactoryToken, () => new InvoiceFactory())
```
