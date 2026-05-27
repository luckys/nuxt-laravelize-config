# @luckys_luis/nuxt-laravelize-config — DEPRECADO

[English](./README.md) | [Español]

> ⚠️ **Este paquete fue renombrado a [`@luckys_luis/nuxt-ddd-toolkit`](https://www.npmjs.com/package/@luckys_luis/nuxt-ddd-toolkit).**
>
> Todas las versiones de `@luckys_luis/nuxt-laravelize-config` están deprecadas. Este stub (v0.1.1) solo re-exporta desde el nuevo paquete para que las instalaciones existentes sigan funcionando.

## Migración

```bash
pnpm remove @luckys_luis/nuxt-laravelize-config
pnpm add -D @luckys_luis/nuxt-ddd-toolkit
```

Luego sustituye `@luckys_luis/nuxt-laravelize-config` → `@luckys_luis/nuxt-ddd-toolkit` en todo tu proyecto. Todas las rutas de export y comportamiento son idénticos.

| Import antiguo | Import nuevo |
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

## ¿Por qué el rename?

`nuxt-laravelize-config` empezó como "presets para el ecosistema laravelize" pero creció hasta convertirse en un toolchain DDD completo (plugin ESLint con 12 reglas semánticas, CLI de scaffolding, skills IA, postinstall auto-link). El nombre nuevo `nuxt-ddd-toolkit` refleja ese alcance y desacopla el paquete del runtime `nuxt-laravelize` — puedes usar el toolchain en cualquier proyecto Nuxt con sabor DDD, con o sin el runtime.

Consulta [`@luckys_luis/nuxt-ddd-toolkit`](https://www.npmjs.com/package/@luckys_luis/nuxt-ddd-toolkit) para la documentación completa.
