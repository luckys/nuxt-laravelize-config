# @luckys_luis/nuxt-laravelize-config

English | [Español](./README.es.md)

Shared tooling for the `nuxt-laravelize` ecosystem: linting/formatting presets, an **ESLint plugin with DDD rules**, a **scaffolding CLI**, and an **AI skills catalogue** auto-installed into `.claude/skills/` and `.cursor/rules/`.

## The Laravelize stack

| Package | Role |
|---|---|
| **[`@luckys_luis/nuxt-laravelize-config`](./)** *(this one)* | Toolchain — 12-rule DDD ESLint plugin, scaffolding CLI (`new:*`), shared presets, 15 AI skills with auto-link. |
| [`@luckys_luis/nuxt-laravelize`](../nuxt-laravelize) | Runtime — DI container, controllers, queues, mail, notifications, i18n, policies, seeders, factories, testing helpers. |
| [`@luckys_luis/nuxt-ddd-toolkit`](../nuxt-ddd-toolkit) | Bootstrap layer — capability detection, 1 ESLint rule, 4 skills, minimal preflight CLI. |

## Contents

- [What this package provides](#what-this-package-provides)
- [Installation](#installation)
- [`laravelize` CLI](#laravelize-cli)
- [AI agent skills](#ai-agent-skills)
- [DDD ESLint plugin](#ddd-eslint-plugin)
- [Shared presets](#shared-presets)
- [Development](#development)

## What this package provides

1. **Presets**: ESLint flat (`recommended` / `strict`), Vitest, `tsconfig.base.json`, `oxlintrc.base.json`, `dprint.base.json`, `lefthook.base.yml`.
2. **DDD ESLint plugin** (`./eslint-plugin`): 12 semantic rules guarding DDD invariants (no infra→domain imports, use-case naming, etc.).
3. **`laravelize` CLI** with two command families:
   - `new:*` — scaffolds contexts, aggregates, value objects, repositories, use cases, controllers, resources, listeners, policies, seeders and factories.
   - `skills install|unlink|status` — manages the symlinks to `.claude/skills/` and `.cursor/rules/`.
4. **15 AI skills** bundled in the package; a postinstall hook links them automatically when it detects `.claude/skills/` or `.cursor/rules/` in the consumer repo.

## Installation

```bash
pnpm add -D @luckys_luis/nuxt-laravelize-config
```

> The `postinstall` hook links skills automatically when `.claude/skills/` or `.cursor/rules/` exist. To skip: `LARAVELIZE_SKIP_POSTINSTALL=1 pnpm install`.

## `laravelize` CLI

```bash
# bounded context + module
pnpm laravelize new:context billing
pnpm laravelize new:aggregate Invoice --context=billing --module=invoicing
pnpm laravelize new:value-object InvoiceAmount --context=billing --module=invoicing --type=int
pnpm laravelize new:repository Invoice --context=billing --module=invoicing --impl=drizzle
pnpm laravelize new:use-case InvoiceCreator --context=billing --module=invoicing --aggregate=Invoice --type=command

# HTTP / wiring
pnpm laravelize new:controller CreateInvoice
pnpm laravelize new:resource Invoice --context=billing --module=invoicing --aggregate=Invoice

# Events + side effects
pnpm laravelize new:listener NotifyAdminOfNewInvoice --context=billing --module=invoicing --event=InvoiceCreated --queued
pnpm laravelize new:policy Invoice
pnpm laravelize new:seeder DemoInvoice
pnpm laravelize new:factory Invoice --context=billing --module=invoicing

# skills
pnpm laravelize skills status
pnpm laravelize skills install --target=claude
pnpm laravelize skills unlink
```

Each template emits code that satisfies CodelyTV conventions (`{Aggregate}{Action}er.execute()`, `{Verb}{Noun}Controller.invoke()`, value objects with `#value` + `#ensure*`, repositories with `save/find/search/searchPaginated/count`).

## AI agent skills

Catalogue (15 files in Anthropic `SKILL.md` format):

`nuxt-laravelize-ddd-overview`, `create-bounded-context`, `create-aggregate`, `create-value-object`, `create-repository`, `create-use-case`, `create-controller-with-form-request`, `create-resource`, `create-listener-and-event`, `create-mail`, `create-notification`, `create-policy`, `create-seeder`, `create-factory`, `write-use-case-test-with-object-mother`.

The postinstall hook writes `.laravelize-manifest.json` next to each link; `laravelize skills unlink` removes them cleanly. For Cursor the content is rewritten to `.mdc` with globs `server/contexts/**`, `app/contexts/**`, `tests/**`.

## DDD ESLint plugin

```js
// eslint.config.mjs
import dddPlugin from '@luckys_luis/nuxt-laravelize-config/eslint-plugin'

export default [
  dddPlugin.configs.recommended, // or configs.strict
]
```

**Rules** (`recommended` enables the first 8; `strict` adds the last four):

- `ddd/no-infrastructure-from-domain`
- `ddd/no-application-from-domain`
- `ddd/domain-flat`
- `ddd/use-case-naming` — `{Aggregate}{Action}er` (accepts `-er` and `-or`)
- `ddd/use-case-method-execute`
- `ddd/controller-single-action` — single public `invoke()`
- `ddd/repository-no-throw`
- `ddd/repository-required-methods` — `save/find/search/searchPaginated/count`
- `ddd/controller-naming` — known verbs (Find, Create, Update, …)
- `ddd/aggregate-max-props` — max 4 props when the class declares `toPrimitives`
- `ddd/value-object-private-value`
- `ddd/value-object-no-throw-in-constructor`

## Shared presets

Subpaths: `./eslint`, `./vitest`, `./tsconfig`, `./oxlint`, `./dprint`, `./lefthook`. Examples:

```js
// eslint.config.mjs (without the DDD plugin)
import { defineNuxtLaravelizeEslintConfig } from '@luckys_luis/nuxt-laravelize-config/eslint'
export default defineNuxtLaravelizeEslintConfig({ preset: 'strict' })
```

```ts
// vitest.config.ts
import { mergeConfig, defineConfig } from 'vitest/config'
import { vitestBaseConfig } from '@luckys_luis/nuxt-laravelize-config/vitest'
export default mergeConfig(vitestBaseConfig, defineConfig({ test: { coverage: { reporter: ['html'] } } }))
```

## Development

```bash
pnpm install
pnpm build      # tsup → dist/, copies skills + assets, chmod +x cli/bin.js
pnpm test       # vitest (presets, postinstall, eslint-plugin rule-tester, CLI scaffolding)
pnpm typecheck  # tsc --noEmit
```

## Release

```bash
pnpm lint && pnpm test && pnpm typecheck && pnpm build
npm publish --access public
```
