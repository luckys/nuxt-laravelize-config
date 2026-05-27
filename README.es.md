# @luckys_luis/nuxt-laravelize-config

[English](./README.md) | Español

Toolchain compartido para el ecosistema `nuxt-laravelize`: presets de linting/formato, un **plugin ESLint con reglas DDD**, un **CLI de scaffolding** y un **catálogo de skills IA** que se instalan automáticamente en `.claude/skills/` y `.cursor/rules/`.

## El stack Laravelize

| Paquete | Rol |
|---|---|
| **[`@luckys_luis/nuxt-laravelize-config`](./)** *(este)* | Toolchain — plugin ESLint con 12 reglas DDD, CLI scaffolding (`new:*`), presets, 15 skills IA con auto-link. |
| [`@luckys_luis/nuxt-laravelize`](../nuxt-laravelize) | Runtime — container DI, controllers, queues, mail, notifications, i18n, policies, seeders, factories, testing helpers. |
| [`@luckys_luis/nuxt-ddd-toolkit`](../nuxt-ddd-toolkit) | Capa bootstrap — detección de capacidades, 1 regla ESLint, 4 skills, CLI mínimo de preflight. |

## Tabla de contenido

- [Qué ofrece este paquete](#qué-ofrece-este-paquete)
- [Instalación](#instalación)
- [CLI laravelize](#cli-laravelize)
- [Skills para agentes IA](#skills-para-agentes-ia)
- [Plugin ESLint DDD](#plugin-eslint-ddd)
- [Presets compartidos](#presets-compartidos)
- [Desarrollo](#desarrollo)

## Qué ofrece este paquete

1. **Presets**: ESLint flat (`recommended` / `strict`), Vitest, `tsconfig.base.json`, `oxlintrc.base.json`, `dprint.base.json`, `lefthook.base.yml`.
2. **Plugin ESLint DDD** (`./eslint-plugin`): 12 reglas semánticas que protegen las invariantes de Domain-Driven Design (sin imports infra→domain, naming de use cases, etc.).
3. **CLI `laravelize`** con dos familias de comandos:
   - `new:*` — scaffolding de contextos, agregados, value objects, repositorios, use cases, controladores, recursos, listeners, políticas, seeders y factorías.
   - `skills install|unlink|status` — gestiona los enlaces a `.claude/skills/` y `.cursor/rules/`.
4. **15 Skills IA** publicadas en el paquete; un postinstall las enlaza automáticamente si detecta `.claude/skills/` o `.cursor/rules/` en el repo consumidor.

## Instalación

```bash
pnpm add -D @luckys_luis/nuxt-laravelize-config
```

> El `postinstall` enlaza automáticamente los skills si existen `.claude/skills/` y/o `.cursor/rules/`. Para desactivarlo: `LARAVELIZE_SKIP_POSTINSTALL=1 pnpm install`.

## CLI `laravelize`

```bash
# bounded context + módulo
pnpm laravelize new:context billing
pnpm laravelize new:aggregate Invoice --context=billing --module=invoicing
pnpm laravelize new:value-object InvoiceAmount --context=billing --module=invoicing --type=int
pnpm laravelize new:repository Invoice --context=billing --module=invoicing --impl=drizzle
pnpm laravelize new:use-case InvoiceCreator --context=billing --module=invoicing --aggregate=Invoice --type=command

# HTTP / wiring
pnpm laravelize new:controller CreateInvoice
pnpm laravelize new:resource Invoice --context=billing --module=invoicing --aggregate=Invoice

# Eventos + side effects
pnpm laravelize new:listener NotifyAdminOfNewInvoice --context=billing --module=invoicing --event=InvoiceCreated --queued
pnpm laravelize new:policy Invoice
pnpm laravelize new:seeder DemoInvoice
pnpm laravelize new:factory Invoice --context=billing --module=invoicing

# skills
pnpm laravelize skills status
pnpm laravelize skills install --target=claude
pnpm laravelize skills unlink
```

Cada plantilla emite código que cumple las reglas Codely (`{Aggregate}{Action}er.execute()`, `{Verb}{Noun}Controller.invoke()`, value objects con `#value` + `#ensure*`, repositorios con `save/find/search/searchPaginated/count`).

## Skills para agentes IA

Catálogo (15) en formato Anthropic (`SKILL.md` con frontmatter):

`nuxt-laravelize-ddd-overview`, `create-bounded-context`, `create-aggregate`, `create-value-object`, `create-repository`, `create-use-case`, `create-controller-with-form-request`, `create-resource`, `create-listener-and-event`, `create-mail`, `create-notification`, `create-policy`, `create-seeder`, `create-factory`, `write-use-case-test-with-object-mother`.

El postinstall escribe `.laravelize-manifest.json` en cada destino enlazado; `laravelize skills unlink` los retira limpiamente. Para Cursor el contenido se reescribe a `.mdc` con globs `server/contexts/**`, `app/contexts/**`, `tests/**`.

## Plugin ESLint DDD

```js
// eslint.config.mjs
import dddPlugin from '@luckys_luis/nuxt-laravelize-config/eslint-plugin'

export default [
  dddPlugin.configs.recommended, // o configs.strict
]
```

**Reglas** (`recommended` activa las primeras 8; `strict` añade las cuatro últimas):

- `ddd/no-infrastructure-from-domain`
- `ddd/no-application-from-domain`
- `ddd/domain-flat`
- `ddd/use-case-naming` — `{Aggregate}{Action}er` (acepta `-er` y `-or`)
- `ddd/use-case-method-execute`
- `ddd/controller-single-action` — único método `invoke()`
- `ddd/repository-no-throw`
- `ddd/repository-required-methods` — `save/find/search/searchPaginated/count`
- `ddd/controller-naming` — verbos conocidos (Find, Create, Update, …)
- `ddd/aggregate-max-props` — máximo 4 props si la clase declara `toPrimitives`
- `ddd/value-object-private-value`
- `ddd/value-object-no-throw-in-constructor`

## Presets compartidos

Subpaths: `./eslint`, `./vitest`, `./tsconfig`, `./oxlint`, `./dprint`, `./lefthook`. Ejemplos:

```js
// eslint.config.mjs (sin plugin DDD)
import { defineNuxtLaravelizeEslintConfig } from '@luckys_luis/nuxt-laravelize-config/eslint'
export default defineNuxtLaravelizeEslintConfig({ preset: 'strict' })
```

```ts
// vitest.config.ts
import { mergeConfig, defineConfig } from 'vitest/config'
import { vitestBaseConfig } from '@luckys_luis/nuxt-laravelize-config/vitest'
export default mergeConfig(vitestBaseConfig, defineConfig({ test: { coverage: { reporter: ['html'] } } }))
```

## Desarrollo

```bash
pnpm install
pnpm build      # tsup → dist/, copia skills + assets + cli/bin.js +755
pnpm test       # vitest (presets, postinstall, eslint-plugin rule-tester, CLI scaffolding)
pnpm typecheck  # tsc --noEmit
```

## Proceso de publicación

```bash
pnpm lint && pnpm test && pnpm typecheck && pnpm build
npm publish --access public
```
