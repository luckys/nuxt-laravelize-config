---
name: create-repository
description: Use this skill to create a repository for an aggregate in a nuxt-laravelize project. Interface lives in domain/, implementations in infrastructure/. Repositories declare save/find/search/searchPaginated/count and NEVER throw.
---

# Create Repository

A repository is the only abstraction the domain has for persistence. The **interface** belongs to `domain/`; **implementations** to `infrastructure/`.

## Preferred: CLI

```bash
laravelize new:repository <Aggregate> --context=<c> --module=<m> --impl=drizzle|memory
# example
laravelize new:repository Invoice --context=billing --module=invoicing --impl=drizzle
```

## Interface (in `domain/`)

```ts
// server/contexts/billing/invoicing/domain/InvoiceRepository.ts
import type { Invoice } from './Invoice'
import type { InvoiceId } from './InvoiceId'
import type { Criteria } from '../../../shared/domain/Criteria'
import type { Paginator } from '../../../shared/domain/Paginator'

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>
  find(id: InvoiceId): Promise<Invoice | null>
  search(criteria: Criteria): Promise<readonly Invoice[]>
  searchPaginated(criteria: Criteria, page: number, perPage: number): Promise<Paginator<Invoice>>
  count(criteria: Criteria): Promise<number>
}
```

## Implementation (Drizzle, in `infrastructure/`)

```ts
// server/contexts/billing/invoicing/infrastructure/DrizzleInvoiceRepository.ts
import { eq } from 'drizzle-orm'
import type { Database } from '../../../shared/infrastructure/Database'
import { invoicesTable } from './schema'
import type { InvoiceRepository } from '../domain/InvoiceRepository'
import { Invoice } from '../domain/Invoice'

export class DrizzleInvoiceRepository implements InvoiceRepository {
  constructor(private readonly db: Database) {}

  async save(invoice: Invoice): Promise<void> {
    const p = invoice.toPrimitives()
    await this.db.insert(invoicesTable).values(p).onConflictDoUpdate({
      target: invoicesTable.id,
      set: p,
    })
  }

  async find(id: InvoiceId): Promise<Invoice | null> {
    const row = await this.db.select().from(invoicesTable).where(eq(invoicesTable.id, id.value)).get()
    if (row === undefined) return null
    return Invoice.fromPrimitives(row)
  }

  async search(_criteria: Criteria): Promise<readonly Invoice[]> {
    // map criteria → drizzle where clauses
    const rows = await this.db.select().from(invoicesTable).all()
    return rows.map(Invoice.fromPrimitives)
  }

  async searchPaginated(criteria: Criteria, page: number, perPage: number): Promise<Paginator<Invoice>> {
    // delegate to shared Paginator helpers
  }

  async count(_criteria: Criteria): Promise<number> {
    const [row] = await this.db.select({ c: count(invoicesTable.id) }).from(invoicesTable)
    return row?.c ?? 0
  }
}
```

## Wiring

Register the binding in a `ServiceProvider`:

```ts
// server/contexts/billing/invoicing/infrastructure/InvoicingServiceProvider.ts
import { ServiceProvider } from '@luckys_luis/nuxt-laravelize'
import { invoiceRepositoryToken } from '../domain/tokens'
import { DrizzleInvoiceRepository } from './DrizzleInvoiceRepository'

export class InvoicingServiceProvider extends ServiceProvider {
  register(): void {
    this.container.singleton(invoiceRepositoryToken, (c) => new DrizzleInvoiceRepository(c.resolve('database')))
  }
}
```

## Rules (hard)

- Method set is exactly: `save`, `find(id)`, `search(criteria)`, `searchPaginated(criteria, page, perPage)`, `count(criteria)`. The `ddd/repository-required-methods` lint enforces this.
- **NEVER throw.** Return `null`, empty array, or a `Result` type. Errors bubble from infrastructure are caught by callers (use cases) and translated to domain errors. The `ddd/repository-no-throw` lint catches `Promise<never>` returns or `@throws` JSDoc.
- `implements` not `extends`. Interfaces only.
- Use `InMemory<Aggregate>Repository` in tests (Object Mothers populate it).

## Test stub

```ts
export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly store = new Map<string, Invoice>()
  async save(i: Invoice) { this.store.set(i.toPrimitives().id, i) }
  async find(id: InvoiceId) { return this.store.get(id.value) ?? null }
  async search() { return [...this.store.values()] }
  async searchPaginated() { /* ... */ }
  async count() { return this.store.size }
}
```
