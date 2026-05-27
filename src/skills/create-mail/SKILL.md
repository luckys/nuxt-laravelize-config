---
name: create-mail
description: Use this skill to create a Mailable in a nuxt-laravelize project. Mailables encapsulate a single outgoing email — recipient(s), subject, render() HTML, optional text() and attachments(). They are sent through the configured Mailer driver.
---

# Create Mail (Mailable)

A `Mailable` is a class that owns the data and rendering of one outbound email. It is **not** a transport — the `Mailer` driver (LogMailer / Nodemailer / Resend) is.

## Template

```ts
// server/mails/InvoicePaidMail.ts
import { Mailable } from '@luckys_luis/nuxt-laravelize'

export class InvoicePaidMail extends Mailable {
  constructor(
    private readonly recipient: string,
    private readonly invoiceId: string,
    private readonly amount: number,
  ) { super() }

  to(): string { return this.recipient }
  override from(): string { return 'billing@example.com' }
  override subject(): string { return `Invoice ${this.invoiceId} paid` }

  async render(): Promise<string> {
    return /* html */`
      <h1>Thanks!</h1>
      <p>Invoice <strong>${this.invoiceId}</strong> for ${this.amount} has been paid.</p>
    `
  }

  override async text(): Promise<string> {
    return `Invoice ${this.invoiceId} for ${this.amount} has been paid.`
  }
}
```

## Sending

From a use case or listener:

```ts
import type { Mailer } from '@luckys_luis/nuxt-laravelize'

class NotifyOnInvoicePaid {
  constructor(private readonly mailer: Mailer) {}

  async handle(event: InvoicePaid): Promise<void> {
    await this.mailer.send(new InvoicePaidMail(event.recipientEmail, event.invoiceId, event.amount))
  }
}
```

In a controller (rare — prefer events/listeners):

```ts
const mailer = useMailer(event)
await mailer.send(new InvoicePaidMail(...))
```

## Drivers

Configure in `nuxt.config.ts`:

```ts
laravelize: {
  mail: {
    driver: 'log' | 'nodemailer' | 'resend',
    // driver-specific options
  },
}
```

- `log`: writes the message to the configured Logger. Use in dev/test.
- `nodemailer`: requires `nodemailer` peer.
- `resend`: requires `resend` peer.

## Rules

- One Mailable per file. Class name ends in `Mail`.
- `Mailable` owns rendering; the **template** can live inline (template literal) or in a `mails/templates/*.vue|.html` file rendered via your own helper. Keep this skill agnostic.
- Mailables MUST be serialisable if sent through `QueueChannel` → keep constructor args primitive (`string`, `number`, `Date.toISOString()`).
- NEVER call `mailer.send` from the domain layer. Use a listener or use case.
- For multi-recipient: return `string[]` from `to()`.

## Testing

Use `FakeMailer` from `@luckys_luis/nuxt-laravelize/testing`:

```ts
const { mailer } = mountLaravelize({ fakes: { mailer: true } })
await useCase.execute()
mailer.assertMailed(InvoicePaidMail, (m) => m.to() === 'user@example.com')
```
