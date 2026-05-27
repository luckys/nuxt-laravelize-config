---
name: create-seeder
description: Use this skill to create a database seeder in a nuxt-laravelize project. Seeders extend Seeder, expose run(), are auto-discovered from server/database/seeders/, and are invoked via the laravelize-db-seed CLI. Use Factories for fixture data.
---

# Create Seeder

A `Seeder` populates the database with deterministic or generated data — for dev environments, CI, demo accounts.

## Preferred: CLI

```bash
laravelize new:seeder <Name> --module=<m>
# example
laravelize new:seeder DemoInvoiceSeeder --module=invoicing
```

## Template

```ts
// server/database/seeders/DemoInvoiceSeeder.seeder.ts
import { Seeder } from '@luckys_luis/nuxt-laravelize'
import type { InvoiceRepository } from '~/server/contexts/billing/invoicing/domain/InvoiceRepository'
import { InvoiceFactory } from '../factories/InvoiceFactory'

export class DemoInvoiceSeeder extends Seeder {
  constructor(
    private readonly invoices: InvoiceRepository,
    private readonly factory: InvoiceFactory,
  ) { super() }

  async run(): Promise<void> {
    const samples = this.factory.count(50).make() as Invoice[]
    for (const invoice of samples) {
      await this.invoices.save(invoice)
    }
  }
}
```

## Running

Auto-discovery: files matching `server/database/seeders/*.seeder.ts` are picked up.

```bash
# run all discovered seeders
laravelize-db-seed

# run one
laravelize-db-seed --class=DemoInvoiceSeeder
```

The bin loads a `laravelize.seed.config.ts` (or accepts `--config=<path>`) that wires the container with infrastructure providers (database, repos, factories), then resolves and invokes each seeder.

## Rules

- One seeder per file. File suffix `.seeder.ts`. Class name suffix `Seeder`.
- `run()` is the only entry point — declared `async`, returns `Promise<void>`.
- Seeders depend on **repositories**, not directly on the database. They use the same write paths as the application.
- NEVER reach into raw SQL — go through repos. (Exception: read-only verification queries are fine.)
- Idempotent if possible: detect existing records and skip, or `truncate` first at the start of `run()` only in dev/test environments.

## Wiring

Auto-register in a `ServiceProvider`:

```ts
register(): void {
  this.container.transient(DemoInvoiceSeeder, (c) =>
    new DemoInvoiceSeeder(c.resolve(invoiceRepositoryToken), c.resolve(invoiceFactoryToken)),
  )
  this.container.resolve(seederRegistryToken).register('DemoInvoiceSeeder', () => this.container.resolve(DemoInvoiceSeeder))
}
```

## Pairing with Factories

A seeder typically composes generated samples from a `Factory`. See `create-factory`.
