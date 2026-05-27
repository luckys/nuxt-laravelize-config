---
name: create-value-object
description: Use this skill to create a Value Object in a nuxt-laravelize domain layer. Enforces CodelyTV style — private #value field, getter, #ensure* private guards, createNone() factory for nullables, never throw in constructor inline.
---

# Create Value Object

Value Objects wrap primitives to give them identity-by-value, validation and behaviour. Live in `server/contexts/<context>/<module>/domain/` (flat).

## Preferred: CLI

```bash
laravelize new:value-object <Name> --context=<c> --module=<m> --type=string|uuid|int|enum
# example
laravelize new:value-object InvoiceAmount --context=billing --module=invoicing --type=int
```

## Hand-written templates

### String VO

```ts
// server/contexts/billing/invoicing/domain/InvoiceCustomerId.ts
export class InvoiceCustomerId {
  readonly #value: string

  constructor(value: string) {
    this.#ensureIsNotEmpty(value)
    this.#value = value
  }

  static createNone(): InvoiceCustomerId | null {
    return null
  }

  get value(): string {
    return this.#value
  }

  toString(): string {
    return this.#value
  }

  equals(other: InvoiceCustomerId): boolean {
    return this.#value === other.#value
  }

  #ensureIsNotEmpty(value: string): void {
    if (value.trim().length === 0) {
      throw new InvoiceCustomerIdEmpty()
    }
  }
}

export class InvoiceCustomerIdEmpty extends Error {
  constructor() { super('InvoiceCustomerId cannot be empty'); this.name = 'InvoiceCustomerIdEmpty' }
}
```

### UUID v7 VO

Extend `Uuid` from `server/contexts/shared/domain/Uuid.ts` (create once, reuse). Always UUID v7 (time-ordered) — generated on the frontend with `crypto.randomUUID()` if v7-capable, or a shared util.

### Int / Money VO

```ts
export class InvoiceAmount {
  readonly #value: number

  constructor(value: number) {
    this.#ensureIsNonNegative(value)
    this.#ensureIsInteger(value)
    this.#value = value
  }

  get value(): number { return this.#value }

  add(other: InvoiceAmount): InvoiceAmount { return new InvoiceAmount(this.#value + other.#value) }

  #ensureIsNonNegative(v: number): void { if (v < 0) throw new InvalidInvoiceAmount(v) }
  #ensureIsInteger(v: number): void { if (!Number.isInteger(v)) throw new InvalidInvoiceAmount(v) }
}
```

### Frontend (functional) VO

Frontend uses opaque types + factories returning `Result`:

```ts
// app/contexts/billing/domain/InvoiceCustomerId.ts
const tag = Symbol('InvoiceCustomerId')
export type InvoiceCustomerId = { readonly [tag]: true; readonly value: string }

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export function createInvoiceCustomerId(value: string): Result<InvoiceCustomerId, 'empty'> {
  if (value.trim().length === 0) return { ok: false, error: 'empty' }
  return { ok: true, value: { [tag]: true, value } as InvoiceCustomerId }
}
```

## Rules (lint enforces)

- Field is `readonly #value` (private). The `ddd/value-object-private-value` rule fails on `public value` or setters.
- All validation in private `#ensure*` methods called from constructor. The `ddd/value-object-no-throw-in-constructor` rule fails on inline `throw` inside the constructor body.
- For nullables expose `static createNone()`. Do NOT add `fromPrimitive`/`fromPrimitives` on VOs (those belong to aggregates).
- `toString()` only when the underlying type is not string.
- One VO per file.

## Tests

`tests/contexts/<context>/<module>/domain/<VO>.test.ts`: cover valid construction, each invariant, equality, and `createNone()` when applicable.
