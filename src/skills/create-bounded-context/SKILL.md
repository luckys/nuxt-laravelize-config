---
name: create-bounded-context
description: Use this skill to scaffold a new bounded context in a nuxt-laravelize project. Creates both the backend (server/contexts) and frontend (app/contexts) skeleton following CodelyTV DDD layering.
---

# Create Bounded Context

A bounded context groups one or more related modules. Each module owns its `domain / application / infrastructure` layers.

## Preferred: CLI

```bash
laravelize new:context <name>
# example
laravelize new:context billing
```

This creates:

```
server/contexts/billing/.gitkeep
app/contexts/billing/.gitkeep
```

Add modules with `laravelize new:aggregate` / `new:use-case` etc. — the first such command creates the module folder under the context.

## Manual fallback

Create exactly these folders. Do NOT add files yet — the module folders appear when the first aggregate/use-case is added.

```
server/contexts/<context>/
app/contexts/<context>/
```

## Rules

- Context name is **kebab-case** singular noun (`billing`, `identity-access`, `catalog`).
- Contexts NEVER import from each other directly — communicate via domain events.
- Sharing primitives across contexts → put them in `server/contexts/shared/` and `app/contexts/shared/`.
- One context per top-level business capability. If unsure, start with one and split later.

After creating the context, the typical next step is `create-aggregate` for the root entity, then `create-repository`, then `create-use-case`.
