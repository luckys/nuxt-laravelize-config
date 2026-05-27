# @luckys_luis/nuxt-laravelize-config — DEPRECATED

[English] | [Español](./README.es.md)

> ⚠️ **This package has been renamed to [`@luckys_luis/nuxt-ddd-toolkit`](https://www.npmjs.com/package/@luckys_luis/nuxt-ddd-toolkit).**
>
> All versions of `@luckys_luis/nuxt-laravelize-config` are deprecated. This stub (v0.1.1) only re-exports from the new package so existing installs keep working.

## Migrate

```bash
pnpm remove @luckys_luis/nuxt-laravelize-config
pnpm add -D @luckys_luis/nuxt-ddd-toolkit
```

Then find/replace `@luckys_luis/nuxt-laravelize-config` → `@luckys_luis/nuxt-ddd-toolkit` across your project. All export paths and behaviours are identical.

| Old import | New import |
|---|---|
| `@luckys_luis/nuxt-laravelize-config` | `@luckys_luis/nuxt-ddd-toolkit` |
| `@luckys_luis/nuxt-laravelize-config/eslint` | `@luckys_luis/nuxt-ddd-toolkit/eslint` |
| `@luckys_luis/nuxt-laravelize-config/vitest` | `@luckys_luis/nuxt-ddd-toolkit/vitest` |
| `@luckys_luis/nuxt-laravelize-config/tsconfig` | `@luckys_luis/nuxt-ddd-toolkit/tsconfig` |
| `@luckys_luis/nuxt-laravelize-config/oxlint` | `@luckys_luis/nuxt-ddd-toolkit/oxlint` |
| `@luckys_luis/nuxt-laravelize-config/dprint` | `@luckys_luis/nuxt-ddd-toolkit/dprint` |
| `@luckys_luis/nuxt-laravelize-config/lefthook` | `@luckys_luis/nuxt-ddd-toolkit/lefthook` |
| `@luckys_luis/nuxt-laravelize-config/postinstall` | `@luckys_luis/nuxt-ddd-toolkit/postinstall` |
| `@luckys_luis/nuxt-laravelize-config/eslint-plugin` | `@luckys_luis/nuxt-ddd-toolkit/eslint-plugin` |

## Why the rename?

`nuxt-laravelize-config` started as "presets for the laravelize ecosystem" but grew into a full DDD toolchain (ESLint plugin with 12 semantic rules, scaffolding CLI, AI agent skills, postinstall auto-link). The new name `nuxt-ddd-toolkit` reflects that scope and decouples the package from the `nuxt-laravelize` runtime — you can use the toolchain on any DDD-flavored Nuxt project, with or without the runtime.

See [`@luckys_luis/nuxt-ddd-toolkit`](https://www.npmjs.com/package/@luckys_luis/nuxt-ddd-toolkit) for full documentation.
