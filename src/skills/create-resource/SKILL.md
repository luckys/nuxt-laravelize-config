---
name: create-resource
description: Use this skill to create an API Resource in a nuxt-laravelize project. Resources transform domain objects into JSON payloads following Laravel's API Resources pattern, supporting collections and pagination wrappers.
---

# Create Resource

A Resource is the HTTP-side projection of a domain object. It owns the shape of the JSON payload — never expose `toPrimitives()` directly.

## Preferred: CLI

```bash
laravelize new:resource <Name> --context=<c> --module=<m> --aggregate=<Aggregate>
# example
laravelize new:resource Invoice --context=billing --module=invoicing --aggregate=Invoice
```

## Template

```ts
// server/responses/InvoiceResource.ts
import type { H3Event } from 'h3'
import { Resource } from '@luckys_luis/nuxt-laravelize'
import type { Invoice } from '~/server/contexts/billing/invoicing/domain/Invoice'

export class InvoiceResource extends Resource<Invoice> {
  toArray(_event: H3Event): Record<string, unknown> {
    const p = this.value.toPrimitives()
    return {
      id: p.id,
      customer_id: p.customerId,
      amount: p.amount,
      status: p.status,
      // computed / derived fields go here
      links: {
        self: `/api/invoices/${p.id}`,
      },
    }
  }
}
```

## Collection

```ts
import { ResourceCollection } from '@luckys_luis/nuxt-laravelize'

const collection = new ResourceCollection(invoices, InvoiceResource)
return collection // defineLaravelizedHandler serialises automatically
```

## Paginated

```ts
import { PaginatedResourceCollection } from '@luckys_luis/nuxt-laravelize'

const paginator = await repo.searchPaginated(criteria, page, perPage)
return new PaginatedResourceCollection(paginator, InvoiceResource)
// → { data: [...], meta: { page, perPage, total, lastPage }, links: { ... } }
```

## Rules

- Resource is suffix `Resource`, sibling of the aggregate name (`InvoiceResource` for `Invoice`).
- Lives in `server/responses/` (project convention).
- `toArray(event)` is the only public extension point. You may add private helpers `#field*` for clarity.
- snake_case field names for HTTP output (frontend conventions translate at the boundary). camelCase internally.
- NEVER reach into infrastructure from here — accept already-loaded data.
- Never throw — if a field is missing, return `null` or compute a fallback.

## Conditional fields

```ts
toArray(event) {
  const p = this.value.toPrimitives()
  return {
    ...this.when(p.status === 'paid', { paid_at: p.paidAt }),
    id: p.id,
  }
}
```

`this.when(condition, payload)` returns the payload or omits it. Available via the base class.
