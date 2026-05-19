# @luckys_luis/nuxt-laravelize-config

[English](./README.md) | Español

Presets compartidos de tooling para el ecosistema `nuxt-laravelize`.

Este paquete centraliza reglas de linting, testing, formateo y hooks para que varios repositorios mantengan la misma base sin duplicar archivos de configuración.

## Tabla de contenido

- [Qué ofrece este paquete](#qué-ofrece-este-paquete)
- [Instalación](#instalación)
- [API pública](#api-pública)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Detalles de comportamiento](#detalles-de-comportamiento)
- [Desarrollo](#desarrollo)
- [Proceso de publicación](#proceso-de-publicación)

## Qué ofrece este paquete

- Una fábrica reutilizable de configuración ESLint flat con presets `recommended` y `strict`.
- Una configuración base de Vitest para repositorios de módulos y tooling sobre Node.
- Exports de rutas para archivos base:
  - TypeScript (`tsconfig.base.json`)
  - Oxlint (`oxlintrc.base.json`)
  - dprint (`dprint.base.json`)
  - Lefthook (`lefthook.base.yml`)

## Instalación

Instálalo como dependencia de desarrollo:

```bash
pnpm add -D @luckys_luis/nuxt-laravelize-config
```

## API pública

Export principal (`@luckys_luis/nuxt-laravelize-config`):

- `defineNuxtLaravelizeEslintConfig(options?)`
- `eslintBaseConfig`
- `vitestBaseConfig`
- `tsconfigBasePath`
- `oxlintBaseConfigPath`
- `dprintBaseConfigPath`
- `lefthookBaseConfigPath`

Subpath exports:

- `@luckys_luis/nuxt-laravelize-config/eslint`
- `@luckys_luis/nuxt-laravelize-config/vitest`
- `@luckys_luis/nuxt-laravelize-config/tsconfig`
- `@luckys_luis/nuxt-laravelize-config/oxlint`
- `@luckys_luis/nuxt-laravelize-config/dprint`
- `@luckys_luis/nuxt-laravelize-config/lefthook`

## Ejemplos de uso

### ESLint (recommended)

```js
import { defineNuxtLaravelizeEslintConfig } from '@luckys_luis/nuxt-laravelize-config/eslint'

export default defineNuxtLaravelizeEslintConfig()
```

### ESLint (strict)

```js
import { defineNuxtLaravelizeEslintConfig } from '@luckys_luis/nuxt-laravelize-config/eslint'

export default defineNuxtLaravelizeEslintConfig({ preset: 'strict' })
```

### Vitest

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import { vitestBaseConfig } from '@luckys_luis/nuxt-laravelize-config/vitest'

export default mergeConfig(
  vitestBaseConfig,
  defineConfig({
    test: {
      coverage: {
        reporter: ['text', 'html'],
      },
    },
  }),
)
```

### Oxlint

```js
import { oxlintBaseConfigPath } from '@luckys_luis/nuxt-laravelize-config/oxlint'

console.log(oxlintBaseConfigPath)
```

### dprint

```js
import { dprintBaseConfigPath } from '@luckys_luis/nuxt-laravelize-config/dprint'

console.log(dprintBaseConfigPath)
```

### Lefthook

```js
import { lefthookBaseConfigPath } from '@luckys_luis/nuxt-laravelize-config/lefthook'

console.log(lefthookBaseConfigPath)
```

### Ruta base de TypeScript

```js
import { tsconfigBasePath } from '@luckys_luis/nuxt-laravelize-config/tsconfig'

console.log(tsconfigBasePath)
```

## Detalles de comportamiento

### Presets de ESLint

`recommended` incluye:

- `no-unused-vars: error`
- `no-undef: error`
- `no-console: error`

`strict` extiende `recommended` y agrega:

- `no-else-return: error`
- `max-depth: ['error', 1]`

### Valores por defecto de Vitest

- `globals: true`
- `environment: 'node'`
- `include: ['test/**/*.test.ts']`

### Convenciones de archivos base

- `tsconfig.base.json`: configuración estricta de TypeScript para librerías y tooling.
- `oxlintrc.base.json`: reglas de corrección y sospechosas con restricciones de estilo.
- `dprint.base.json`: configuración compartida de formateo (`lineWidth: 100`, comillas simples, sin punto y coma).
- `lefthook.base.yml`: comandos de pre-commit para `pnpm lint` y `pnpm test`.

## Desarrollo

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

El build genera salida en `dist/` y publica ESM + tipos.

## Proceso de publicación

1. Actualiza la versión en `package.json`.
2. Ejecuta validaciones de calidad.
3. Construye el paquete.
4. Publica en npm.

```bash
pnpm lint && pnpm test && pnpm typecheck
pnpm build
npm publish --access public
```
