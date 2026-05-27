---
name: create-notification
description: Use this skill to create a Notification in a nuxt-laravelize project. Notifications support multiple delivery channels (mail/log/queue) for the same business event. Notifiables (e.g., User) declare how each channel routes to them.
---

# Create Notification

A `Notification` is a multi-channel message. The same `InvoicePaidNotification` can go to `mail`, `log`, or be enqueued for later delivery — the channel is chosen at send-time based on `via()`.

## Template

```ts
// server/notifications/InvoicePaidNotification.ts
import { Notification, type Notifiable } from '@luckys_luis/nuxt-laravelize'
import { InvoicePaidMail } from '../mails/InvoicePaidMail'

export class InvoicePaidNotification extends Notification {
  constructor(
    private readonly invoiceId: string,
    private readonly amount: number,
  ) { super() }

  via(_n: Notifiable): readonly ('mail' | 'log' | 'queue')[] {
    return ['mail', 'log']
  }

  toMail(notifiable: Notifiable): InvoicePaidMail {
    const email = notifiable.routeNotificationFor('mail')!
    return new InvoicePaidMail(email, this.invoiceId, this.amount)
  }

  toLog(notifiable: Notifiable): string {
    return `Invoice ${this.invoiceId} paid (${this.amount}) → notifiable=${notifiable.routeNotificationFor('log')}`
  }

  toArray(_n: Notifiable): Record<string, unknown> {
    return { invoiceId: this.invoiceId, amount: this.amount }
  }
}
```

## Notifiable

The recipient implements `Notifiable`:

```ts
import type { Notifiable } from '@luckys_luis/nuxt-laravelize'

export class User implements Notifiable {
  constructor(readonly id: string, readonly email: string) {}

  routeNotificationFor(channel: 'mail' | 'log' | 'queue'): string | null {
    if (channel === 'mail') return this.email
    if (channel === 'log') return this.id
    return null
  }
}
```

## Sending

```ts
import type { NotificationManager } from '@luckys_luis/nuxt-laravelize'

class NotifyCustomerOnPayment {
  constructor(private readonly notifier: NotificationManager) {}

  async handle(event: InvoicePaid): Promise<void> {
    const user = await this.users.find(new UserId(event.customerId))
    await this.notifier.send(user!, new InvoicePaidNotification(event.invoiceId, event.amount))
  }
}
```

In a controller: `const notifier = useNotifier(event)`.

## Queue channel

Add `'queue'` to `via()` — the manager enqueues `SendNotificationJob` instead of calling channels inline. Define `toArray()` so the job can serialise the payload across processes. A worker (`laravelize-queue-work`) re-hydrates and delivers.

## Rules

- One notification per file. Class name ends in `Notification`.
- `via()` returns the channel list dynamically per notifiable (allow per-user opt-out).
- Each channel needs its `toX()` method present (lint warning if `via` references a channel without the matching method, in a future rule).
- `Notification`s MUST be serialisable if any channel can be `'queue'` — keep constructor args primitive.

## Testing

```ts
const { notifications } = mountLaravelize({ fakes: { notifications: true } })
await useCase.execute()
notifications.assertSentTo(user, InvoicePaidNotification, (n) => n.amount === 100)
```
