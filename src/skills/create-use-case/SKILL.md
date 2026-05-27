---
name: create-use-case
description: Use this skill to create a use case in a nuxt-laravelize project. Use cases live in application/, are named {Aggregate}{Action}er, expose exactly one execute() method, and depend on repository interfaces (never on infrastructure).
---

# Create Use Case

A use case orchestrates a single intent. Lives in `server/contexts/<context>/<module>/application/<UseCaseFolder>/<UseCase>.ts`. One folder per use case.

## Preferred: CLI

```bash
laravelize new:use-case <Name> \
  --context=<c> --module=<m> \
  --aggregate=<Agg> --action=<verb> \
  --type=command|query
# example
laravelize new:use-case InvoiceCreator \
  --context=billing --module=invoicing \
  --aggregate=Invoice --action=create --type=command
```

## Template

```ts
// server/contexts/billing/invoicing/application/InvoiceCreator/InvoiceCreator.ts
import type { InvoiceRepository } from '../../domain/InvoiceRepository'
import { Invoice } from '../../domain/Invoice'
import { InvoiceId } from '../../domain/InvoiceId'
import { InvoiceAmount } from '../../domain/InvoiceAmount'
import { InvoiceCustomerId } from '../../domain/InvoiceCustomerId'
import { InvoiceCreated } from '../../domain/InvoiceCreated'
import type { Dispatcher } from '@luckys_luis/nuxt-laravelize'

export class InvoiceCreator {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly events: Dispatcher,
  ) {}

  async execute(params: { id: string; customerId: string; amount: number }): Promise<void> {
    const invoice = Invoice.create(
      new InvoiceId(params.id),
      new InvoiceCustomerId(params.customerId),
      new InvoiceAmount(params.amount),
    )
    await this.repository.save(invoice)
    await this.events.dispatch(InvoiceCreated.from(invoice))
  }
}
```

## Rules (lint enforces)

- Filename and class match `{Aggregate}{Action}er` (`InvoiceCreator`, `UserFinder`, `SubscriptionRenewer`). `Action` is a verb in present tense, suffix `er` is always added. The `ddd/use-case-naming` lint checks this.
- Exactly **one public method**: `execute()`. Not `run`, not `handle`. The `ddd/use-case-method-execute` lint checks this.
- Dependencies are **interfaces** from `domain/`, never concrete implementations. The `ddd/no-infrastructure-from-domain` lint also catches the reverse direction; for use cases, the application layer may depend on domain types but not on infrastructure.
- Constructor takes the dependencies (repository, dispatcher, logger, etc.). The container resolves them.
- One folder per use case, even though there's only one file initially. The folder is the unit of versioning.

## Command vs Query

- **Command**: mutates state. Returns `Promise<void>` or the aggregate primitives. Dispatch a domain event after persisting.
- **Query**: read-only. Returns `Promise<Resource | ResourceCollection | Paginator<...>>` or DTO. NEVER mutate.

The `--type` CLI flag drives the template variant.

## Wiring

Register in a `ServiceProvider`:

```ts
this.container.transient(invoiceCreatorToken, (c) =>
  new InvoiceCreator(c.resolve(invoiceRepositoryToken), c.resolve(dispatcherToken))
)
```

## Tests

Always TDD. See `write-use-case-test-with-object-mother`.
