---
name: create-policy
description: Use this skill to create an authorization Policy in a nuxt-laravelize project. Policies group authorization rules for a model (e.g., InvoicePolicy.update). The Gate consults the PolicyRegistry by model name; before() can short-circuit (e.g., admin override).
---

# Create Policy

A `Policy` groups authorization rules for a single aggregate or entity. The framework's `Gate` resolves a policy by the constructor name of the target model.

## Template

```ts
// server/policies/InvoicePolicy.ts
import { Policy } from '@luckys_luis/nuxt-laravelize'
import type { User } from '~/server/contexts/identity/users/domain/User'
import type { Invoice } from '~/server/contexts/billing/invoicing/domain/Invoice'

export class InvoicePolicy extends Policy<User, Invoice> {
  override before(user: User): boolean | null {
    return user.isAdmin ? true : null
  }

  view(user: User, invoice: Invoice): boolean {
    return invoice.toPrimitives().customerId === user.id
  }

  update(user: User, invoice: Invoice): boolean {
    return invoice.toPrimitives().status !== 'paid' && this.view(user, invoice)
  }

  delete(user: User, invoice: Invoice): boolean {
    return user.isAdmin
  }
}
```

`Policy.before()` returning `true` short-circuits to allow, `false` to deny, `null` to defer to the action method.

## Registration

Auto-discovered if placed in `server/policies/*.policy.ts`. Otherwise register manually:

```ts
// any ServiceProvider
register(): void {
  this.container.resolve(policyRegistryToken).register('Invoice', new InvoicePolicy())
}
```

The registry key matches the **model class constructor name**.

## Usage

```ts
// in a use case / controller
const gate = useGate(event)
if (!await gate.allows('update', user, invoice)) {
  throw createError({ statusCode: 403 })
}
```

`gate.allows(action, user, model)` first looks up `policyRegistry.resolve(model.constructor.name)`. If found, calls `before(user)` (short-circuit), else `policy[action](user, model)`. If no policy, falls back to gate rules registered via `gate.define(action, rule)`.

## Rules

- One policy per aggregate, in `server/policies/`. File suffix `.policy.ts`.
- Class name `{Aggregate}Policy`.
- Methods are named after actions (`view`, `update`, `delete`, `restore`, `forceDelete`, custom verbs).
- Methods take `(user, model)` and return `boolean` or `Promise<boolean>`.
- NEVER throw from policy methods. Return `false`.
- `before()` is optional. Return `null` to defer.

## Testing

Policies are pure — test them directly:

```ts
const policy = new InvoicePolicy()
expect(policy.update(adminUser, anyInvoice)).toBe(true) // via before()
expect(policy.update(otherUser, paidInvoice)).toBe(false)
```
