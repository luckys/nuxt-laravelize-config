export const aggregateTemplate = `import type { Identifiable } from './shared'

interface {{Aggregate}}Primitives {
  id: string
}

export class {{Aggregate}} {
  constructor(private readonly id: string) {}

  static create(id: string): {{Aggregate}} {
    return new {{Aggregate}}(id)
  }

  toPrimitives(): {{Aggregate}}Primitives {
    return { id: this.id }
  }

  static fromPrimitives(p: {{Aggregate}}Primitives): {{Aggregate}} {
    return new {{Aggregate}}(p.id)
  }
}
`

export const valueObjectStringTemplate = `export class {{Name}} {
  readonly #value: string

  constructor(value: string) {
    this.#ensureIsNotEmpty(value)
    this.#value = value
  }

  static createNone(): {{Name}} | null {
    return null
  }

  get value(): string {
    return this.#value
  }

  toString(): string {
    return this.#value
  }

  equals(other: {{Name}}): boolean {
    return this.#value === other.#value
  }

  #ensureIsNotEmpty(value: string): void {
    if (value.trim().length === 0) {
      throw new {{Name}}Empty()
    }
  }
}

export class {{Name}}Empty extends Error {
  constructor() {
    super('{{Name}} cannot be empty')
    this.name = '{{Name}}Empty'
  }
}
`

export const valueObjectUuidTemplate = `const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class {{Name}} {
  readonly #value: string

  constructor(value: string) {
    this.#ensureIsUuid(value)
    this.#value = value
  }

  get value(): string {
    return this.#value
  }

  toString(): string {
    return this.#value
  }

  equals(other: {{Name}}): boolean {
    return this.#value === other.#value
  }

  #ensureIsUuid(value: string): void {
    if (!UUID_PATTERN.test(value)) {
      throw new Invalid{{Name}}(value)
    }
  }
}

export class Invalid{{Name}} extends Error {
  constructor(value: string) {
    super(\`Invalid {{Name}}: \${value}\`)
    this.name = 'Invalid{{Name}}'
  }
}
`

export const valueObjectIntTemplate = `export class {{Name}} {
  readonly #value: number

  constructor(value: number) {
    this.#ensureIsInteger(value)
    this.#ensureIsNonNegative(value)
    this.#value = value
  }

  get value(): number {
    return this.#value
  }

  equals(other: {{Name}}): boolean {
    return this.#value === other.#value
  }

  #ensureIsInteger(value: number): void {
    if (!Number.isInteger(value)) throw new Invalid{{Name}}(value)
  }

  #ensureIsNonNegative(value: number): void {
    if (value < 0) throw new Invalid{{Name}}(value)
  }
}

export class Invalid{{Name}} extends Error {
  constructor(value: number) {
    super(\`Invalid {{Name}}: \${value}\`)
    this.name = 'Invalid{{Name}}'
  }
}
`

export const valueObjectEnumTemplate = `const VALUES = ['pending', 'active', 'archived'] as const
export type {{Name}}Value = typeof VALUES[number]

export class {{Name}} {
  readonly #value: {{Name}}Value

  constructor(value: string) {
    this.#ensureIsValid(value)
    this.#value = value as {{Name}}Value
  }

  static values(): readonly {{Name}}Value[] {
    return VALUES
  }

  get value(): {{Name}}Value {
    return this.#value
  }

  equals(other: {{Name}}): boolean {
    return this.#value === other.#value
  }

  #ensureIsValid(value: string): void {
    if (!VALUES.includes(value as {{Name}}Value)) {
      throw new Invalid{{Name}}(value)
    }
  }
}

export class Invalid{{Name}} extends Error {
  constructor(value: string) {
    super(\`Invalid {{Name}}: \${value}\`)
    this.name = 'Invalid{{Name}}'
  }
}
`

export const repositoryInterfaceTemplate = `import type { {{Aggregate}} } from './{{Aggregate}}'

export interface {{Aggregate}}Repository {
  save(aggregate: {{Aggregate}}): Promise<void>
  find(id: string): Promise<{{Aggregate}} | null>
  search(criteria: unknown): Promise<readonly {{Aggregate}}[]>
  searchPaginated(criteria: unknown, page: number, perPage: number): Promise<{
    items: readonly {{Aggregate}}[]
    total: number
    page: number
    perPage: number
  }>
  count(criteria: unknown): Promise<number>
}
`

export const repositoryMemoryTemplate = `import type { {{Aggregate}}Repository } from '../domain/{{Aggregate}}Repository'
import type { {{Aggregate}} } from '../domain/{{Aggregate}}'

export class InMemory{{Aggregate}}Repository implements {{Aggregate}}Repository {
  private readonly store = new Map<string, {{Aggregate}}>()

  async save(aggregate: {{Aggregate}}): Promise<void> {
    this.store.set(aggregate.toPrimitives().id, aggregate)
  }

  async find(id: string): Promise<{{Aggregate}} | null> {
    return this.store.get(id) ?? null
  }

  async search(_criteria: unknown): Promise<readonly {{Aggregate}}[]> {
    return [...this.store.values()]
  }

  async searchPaginated(_criteria: unknown, page: number, perPage: number) {
    const all = [...this.store.values()]
    const start = (page - 1) * perPage
    return {
      items: all.slice(start, start + perPage),
      total: all.length,
      page,
      perPage,
    }
  }

  async count(_criteria: unknown): Promise<number> {
    return this.store.size
  }
}
`

export const repositoryDrizzleTemplate = `import type { {{Aggregate}}Repository } from '../domain/{{Aggregate}}Repository'
import type { {{Aggregate}} } from '../domain/{{Aggregate}}'

export class Drizzle{{Aggregate}}Repository implements {{Aggregate}}Repository {
  constructor(private readonly db: unknown) {}

  async save(_aggregate: {{Aggregate}}): Promise<void> {
    throw new Error('TODO: implement save with Drizzle table')
  }

  async find(_id: string): Promise<{{Aggregate}} | null> {
    throw new Error('TODO: implement find with Drizzle')
  }

  async search(_criteria: unknown): Promise<readonly {{Aggregate}}[]> {
    throw new Error('TODO: implement search with Drizzle')
  }

  async searchPaginated(_criteria: unknown, _page: number, _perPage: number) {
    throw new Error('TODO: implement searchPaginated with Drizzle')
  }

  async count(_criteria: unknown): Promise<number> {
    throw new Error('TODO: implement count with Drizzle')
  }
}
`

export const useCaseCommandTemplate = `import type { {{Aggregate}}Repository } from '../../domain/{{Aggregate}}Repository'
import { {{Aggregate}} } from '../../domain/{{Aggregate}}'

export class {{UseCase}} {
  constructor(private readonly repository: {{Aggregate}}Repository) {}

  async execute(input: { id: string }): Promise<void> {
    const aggregate = {{Aggregate}}.create(input.id)
    await this.repository.save(aggregate)
  }
}
`

export const useCaseQueryTemplate = `import type { {{Aggregate}}Repository } from '../../domain/{{Aggregate}}Repository'
import type { {{Aggregate}} } from '../../domain/{{Aggregate}}'

export class {{UseCase}} {
  constructor(private readonly repository: {{Aggregate}}Repository) {}

  async execute(input: { id: string }): Promise<{{Aggregate}} | null> {
    return this.repository.find(input.id)
  }
}
`

export const controllerTemplate = `import type { H3Event } from 'h3'

export class {{Name}}Controller {
  constructor(private readonly useCase: { execute(input: unknown): Promise<unknown> }) {}

  async invoke(_event: H3Event, input: unknown): Promise<unknown> {
    return this.useCase.execute(input)
  }
}
`

export const formRequestTemplate = `import { z } from 'zod'
import { FormRequest } from '@luckys_luis/nuxt-laravelize'

export class {{Name}}Request extends FormRequest {
  rules() {
    return z.object({
      id: z.string(),
    })
  }
}

export type {{Name}}Input = z.infer<ReturnType<{{Name}}Request['rules']>>
`

export const resourceTemplate = `import type { H3Event } from 'h3'
import { Resource } from '@luckys_luis/nuxt-laravelize'
import type { {{Aggregate}} } from '~/server/contexts/{{context}}/{{module}}/domain/{{Aggregate}}'

export class {{Name}}Resource extends Resource<{{Aggregate}}> {
  toArray(_event: H3Event): Record<string, unknown> {
    const p = this.value.toPrimitives()
    return { id: p.id }
  }
}
`

export const listenerTemplate = `import { Listener } from '@luckys_luis/nuxt-laravelize'
import type { {{Event}} } from '../../domain/{{Event}}'

export class {{Name}} extends Listener<{{Event}}> {
  static readonly EVENT = '{{eventName}}'
{{queueStatic}}
  async handle(_event: {{Event}}): Promise<void> {
    // TODO: implement
  }
}
`

export const policyTemplate = `import { Policy } from '@luckys_luis/nuxt-laravelize'

export class {{Aggregate}}Policy extends Policy<unknown, unknown> {
  override before(_user: unknown): boolean | null {
    return null
  }

  view(_user: unknown, _model: unknown): boolean {
    return true
  }

  update(_user: unknown, _model: unknown): boolean {
    return false
  }

  delete(_user: unknown, _model: unknown): boolean {
    return false
  }
}
`

export const seederTemplate = `import { Seeder } from '@luckys_luis/nuxt-laravelize'

export class {{Name}}Seeder extends Seeder {
  async run(): Promise<void> {
    // TODO: implement seeding logic
  }
}
`

export const factoryTemplate = `import { Factory } from '@luckys_luis/nuxt-laravelize'
import { {{Aggregate}} } from '~/server/contexts/{{context}}/{{module}}/domain/{{Aggregate}}'

export class {{Aggregate}}Factory extends Factory<{{Aggregate}}> {
  protected definition(): {{Aggregate}} {
    return {{Aggregate}}.create(this.faker.string.uuid())
  }
}
`

export const gitkeepTemplate = ''
