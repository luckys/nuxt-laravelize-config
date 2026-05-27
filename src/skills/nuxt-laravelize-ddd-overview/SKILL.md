---
name: nuxt-laravelize-ddd-overview
description: Use this skill when working on a project that uses @luckys_luis/nuxt-laravelize. Establishes the DDD architecture, naming conventions (CodelyTV style), folder layout, and how Nuxt/Nitro primitives wire to use cases, aggregates and value objects.
---

# Nuxt Laravelize — DDD Overview

Projects using `@luckys_luis/nuxt-laravelize` follow CodelyTV-style DDD adapted to Nuxt 4 + Nitro. Reuse the runtime primitives the module ships — do not roll your own.

## Folder layout (full-stack Nuxt)

```
server/contexts/<context>/<module>/
  domain/                # entities, aggregates, value objects, repository interfaces, domain events (FLAT, no subfolders)
  application/
    <UseCaseFolder>/     # one folder per use case
      <Aggregate><Action>er.ts
  infrastructure/        # drizzle repos, http adapters, queue/mail/notification implementations
server/api/...           # Nitro endpoints — thin: delegate to a Controller class
server/controllers/      # Single-action controllers (one per endpoint)
server/requests/         # FormRequest subclasses (Zod schemas)
server/responses/        # Resource subclasses

app/contexts/<context>/  # frontend mirror: domain, application, infrastructure, presentation
app/components/          # UI only, no business rules
app/composables/         # client hooks
```

## Naming (mandatory)

- **Aggregates / Entities**: PascalCase, simple name (`Invoice`, `Subscription`).
- **Value Objects**: PascalCase suffix matches concept (`InvoiceId`, `UserEmail`, `MoneyAmount`).
- **Use Cases**: `{Aggregate}{Action}er` — `InvoiceCreator`, `UserFinder`, `SubscriptionRenewer`. One public method: `execute()`.
- **Controllers**: `{Verb}{Noun}Controller` — `CreateInvoiceController`, `FindUserController`. One public method: `invoke(event)`.
- **Requests**: `{Verb}{Noun}Request` (extends `FormRequest`).
- **Responses / Resources**: `{Noun}Resource` (extends `Resource`).
- **Domain events**: `{Aggregate}{PastTense}` — `InvoiceCreated`, `SubscriptionRenewed`.
- **Listeners**: `{Aggregate}{PastTense}{Action}Listener` — `InvoiceCreatedNotifyAdminListener`.
- **Repositories**: interface `{Aggregate}Repository` (in `domain/`), implementations `{Driver}{Aggregate}Repository` (in `infrastructure/`).

## Runtime primitives to use (do not reinvent)

- DI container: resolve via `useContainer(event)` server-side. Register services in `ServiceProvider` subclasses (auto-discovered).
- HTTP wiring: `defineLaravelizedHandler({ controller, request })` in `server/api/**/*.ts`.
- Validation: extend `FormRequest`; `rules()` returns Standard Schema (zod/valibot).
- Events: `Dispatcher.dispatch(event)`; subscribe via `EventSubscriber` registered in providers.
- Queue: `Queue.dispatch(job)`. Default driver `memory`, swap to `bullmq` via module config.
- Pagination: `LengthAwarePaginator` / `CursorPaginator` / `SimplePaginator`.
- Resources: extend `Resource` → `toArray(event)`.
- Authorization: `Gate.allows(action, user, model)`; or define `Policy` subclasses.

## Rules to enforce (lint catches these)

- `domain/` MUST be flat — no `value-objects/`, `aggregates/` subfolders.
- `domain/` MUST NOT import from `application/` or `infrastructure/`.
- Repositories MUST declare `save / find / search / searchPaginated / count`. NEVER throw.
- Value Objects MUST use private `#value` field, expose getter, validate in `#ensure*` private methods, NEVER throw inline in the constructor.
- Aggregates MUST have ≤ 4 instance properties; serialise via `toPrimitives()` / static `fromPrimitives()`.
- Use cases MUST expose only `execute()` — not `run`, not `handle`.
- Controllers MUST be single-action with `invoke()`.

## TDD workflow

1. Write a failing Vitest test under `tests/contexts/<context>/<module>/...` using Object Mothers.
2. Make it green by implementing in `application/` and `domain/`.
3. Refactor. Repeat.

Use sister skills: `create-bounded-context`, `create-aggregate`, `create-value-object`, `create-repository`, `create-use-case`, `create-controller-with-form-request`, `create-resource`, `create-listener-and-event`, `create-mail`, `create-notification`, `create-policy`, `create-seeder`, `create-factory`, `write-use-case-test-with-object-mother`.

If `laravelize` CLI is available, prefer `laravelize new:*` over hand-typing scaffolding.
