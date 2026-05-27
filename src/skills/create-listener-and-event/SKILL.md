---
name: create-listener-and-event
description: Use this skill to add a domain event plus one or more listeners in a nuxt-laravelize project. Events live in domain/, listeners in application/. Subscriptions are registered in a ServiceProvider. Supports queued listeners.
---

# Domain Event + Listener

Domain events let a context react to changes in another, without coupling. The aggregate raises the event; the dispatcher publishes it; listeners subscribe.

## Preferred: CLI

```bash
laravelize new:listener <Name> \
  --context=<c> --module=<m> --event=<Event> [--queued]
# example
laravelize new:listener NotifyAdminOfNewInvoice \
  --context=billing --module=invoicing --event=InvoiceCreated --queued
```

## Event (in `domain/`)

```ts
// server/contexts/billing/invoicing/domain/InvoiceCreated.ts
import type { Invoice } from './Invoice'

export class InvoiceCreated {
  static readonly EVENT_NAME = 'invoicing.invoice.created' as const

  constructor(
    readonly invoiceId: string,
    readonly customerId: string,
    readonly amount: number,
    readonly occurredOn: Date,
  ) {}

  static from(invoice: Invoice): InvoiceCreated {
    const p = invoice.toPrimitives()
    return new InvoiceCreated(p.id, p.customerId, p.amount, new Date())
  }

  toPrimitives(): { invoiceId: string; customerId: string; amount: number; occurredOn: string } {
    return {
      invoiceId: this.invoiceId,
      customerId: this.customerId,
      amount: this.amount,
      occurredOn: this.occurredOn.toISOString(),
    }
  }
}
```

## Listener (in `application/`)

```ts
// server/contexts/billing/invoicing/application/NotifyAdminOfNewInvoice/NotifyAdminOfNewInvoice.ts
import { Listener } from '@luckys_luis/nuxt-laravelize'
import { InvoiceCreated } from '../../domain/InvoiceCreated'
import type { Mailer } from '@luckys_luis/nuxt-laravelize'

export class NotifyAdminOfNewInvoice extends Listener<InvoiceCreated> {
  static readonly EVENT = InvoiceCreated.EVENT_NAME
  static readonly QUEUE = 'mail' // omit to run sync

  constructor(private readonly mailer: Mailer) { super() }

  async handle(event: InvoiceCreated): Promise<void> {
    // build a Mailable and send (see create-mail)
  }
}
```

`Listener` is the base class shipped by the module. Override `handle(event)`.

## Registering subscriptions (provider)

```ts
// server/contexts/billing/invoicing/infrastructure/InvoicingServiceProvider.ts
import { ServiceProvider, type EventSubscriber } from '@luckys_luis/nuxt-laravelize'
import { NotifyAdminOfNewInvoice } from '../application/NotifyAdminOfNewInvoice/NotifyAdminOfNewInvoice'

export class InvoicingServiceProvider extends ServiceProvider {
  subscriptions(): EventSubscriber {
    return {
      [NotifyAdminOfNewInvoice.EVENT]: [NotifyAdminOfNewInvoice],
    }
  }
}
```

## Queued listeners

Set `static QUEUE = '<queueName>'` on the Listener class. The dispatcher then enqueues a `ListenerJob` instead of calling `handle` inline. Run a worker:

```bash
laravelize-queue-work --queue=mail
```

The worker resolves the listener from the container, hydrates the event, and invokes `handle()`.

## Rules

- Event class names are past-tense facts (`InvoiceCreated`, `UserSignedUp`), in `domain/`.
- Events are immutable — readonly fields, no setters.
- Events MUST have `static EVENT_NAME` and a `toPrimitives()` method (used by queue serialisation).
- Listeners in `application/` follow `{Subject}{Action}` naming and extend `Listener<TEvent>`.
- One listener per file/folder.
- Listeners depend on interfaces (use cases, ports), never directly on infrastructure.

## Tests

Listeners are unit-tested with a fake event and fake dependencies. Use a `FakeMailer`/`FakeLogger` from `@luckys_luis/nuxt-laravelize/testing`.
