import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { render, toKebabCase, toPascalCase } from '../src/cli/render/renderTemplate'
import { writeArtifact } from '../src/cli/fs/writeArtifact'

const here = dirname(fileURLToPath(import.meta.url))
const BIN = resolve(here, '..', 'dist', 'cli', 'bin.js')

function runCli(cwd: string, args: readonly string[]): string {
  return execFileSync('node', [BIN, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

describe('renderTemplate', () => {
  it('substitutes simple variables', () => {
    expect(render('hello {{name}}', { name: 'world' })).toBe('hello world')
  })

  it('applies pascal / camel / kebab / lower / upper filters', () => {
    expect(render('{{x|pascal}}', { x: 'invoice-creator' })).toBe('InvoiceCreator')
    expect(render('{{x|camel}}', { x: 'invoice-creator' })).toBe('invoiceCreator')
    expect(render('{{x|kebab}}', { x: 'InvoiceCreator' })).toBe('invoice-creator')
    expect(render('{{x|lower}}', { x: 'ABC' })).toBe('abc')
    expect(render('{{x|upper}}', { x: 'abc' })).toBe('ABC')
  })

  it('throws when a variable is missing', () => {
    expect(() => render('{{missing}}', {})).toThrow(/Missing template variable/)
  })

  it('helper functions are exposed', () => {
    expect(toPascalCase('hello-world')).toBe('HelloWorld')
    expect(toKebabCase('HelloWorld')).toBe('hello-world')
  })
})

describe('writeArtifact', () => {
  let root: string
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'nlz-write-')) })
  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  it('creates a file and intermediate directories', () => {
    const path = join(root, 'a', 'b', 'c.txt')
    expect(writeArtifact(path, 'hi')).toBe('created')
    expect(readFileSync(path, 'utf8')).toBe('hi')
  })

  it('skips an existing file unless force is set', () => {
    const path = join(root, 'a.txt')
    writeArtifact(path, 'first')
    expect(writeArtifact(path, 'second')).toBe('skipped')
    expect(readFileSync(path, 'utf8')).toBe('first')
    expect(writeArtifact(path, 'second', { force: true })).toBe('overwritten')
    expect(readFileSync(path, 'utf8')).toBe('second')
  })
})

describe('CLI scaffolding (bin)', () => {
  let root: string
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'nlz-cli-')) })
  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  it('new:context creates server + app skeletons', () => {
    runCli(root, ['new', 'context', 'billing'])
    expect(existsSync(join(root, 'server', 'contexts', 'billing', '.gitkeep'))).toBe(true)
    expect(existsSync(join(root, 'app', 'contexts', 'billing', '.gitkeep'))).toBe(true)
  })

  it('new:aggregate writes a flat domain file with toPrimitives/fromPrimitives', () => {
    runCli(root, ['new', 'aggregate', 'Invoice', '--context=billing', '--module=invoicing'])
    const path = join(root, 'server', 'contexts', 'billing', 'invoicing', 'domain', 'Invoice.ts')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('export class Invoice')
    expect(content).toContain('toPrimitives()')
    expect(content).toContain('fromPrimitives')
    expect(content).not.toContain('infrastructure')
  })

  it('new:value-object respects --type=string|uuid|int|enum', () => {
    runCli(root, ['new', 'value-object', 'CustomerId', '--context=billing', '--module=invoicing', '--type=uuid'])
    const content = readFileSync(
      join(root, 'server', 'contexts', 'billing', 'invoicing', 'domain', 'CustomerId.ts'),
      'utf8',
    )
    expect(content).toContain('readonly #value: string')
    expect(content).toContain('#ensureIsUuid')
    expect(content).toContain('InvalidCustomerId')
    expect(content).not.toMatch(/^\s+public\s+value/m)
  })

  it('new:repository writes interface + implementation', () => {
    runCli(root, ['new', 'repository', 'Invoice', '--context=billing', '--module=invoicing', '--impl=memory'])
    const ifacePath = join(root, 'server', 'contexts', 'billing', 'invoicing', 'domain', 'InvoiceRepository.ts')
    const implPath = join(root, 'server', 'contexts', 'billing', 'invoicing', 'infrastructure', 'InMemoryInvoiceRepository.ts')
    expect(existsSync(ifacePath)).toBe(true)
    expect(existsSync(implPath)).toBe(true)
    const iface = readFileSync(ifacePath, 'utf8')
    for (const method of ['save', 'find', 'search', 'searchPaginated', 'count']) {
      expect(iface).toContain(`${method}(`)
    }
    const impl = readFileSync(implPath, 'utf8')
    expect(impl).toContain('implements InvoiceRepository')
  })

  it('new:use-case produces a {Aggregate}{Action}er class with execute()', () => {
    runCli(root, [
      'new', 'use-case', 'InvoiceCreator',
      '--context=billing', '--module=invoicing',
      '--aggregate=Invoice', '--type=command',
    ])
    const path = join(
      root, 'server', 'contexts', 'billing', 'invoicing', 'application', 'InvoiceCreator', 'InvoiceCreator.ts',
    )
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('export class InvoiceCreator')
    expect(content).toContain('async execute(')
    expect(content).not.toContain(' run(')
  })

  it('new:controller writes single-action controller + form request', () => {
    runCli(root, ['new', 'controller', 'CreateInvoice'])
    const ctrlPath = join(root, 'server', 'controllers', 'CreateInvoiceController.ts')
    const reqPath = join(root, 'server', 'requests', 'CreateInvoiceRequest.ts')
    expect(existsSync(ctrlPath)).toBe(true)
    expect(existsSync(reqPath)).toBe(true)
    const ctrl = readFileSync(ctrlPath, 'utf8')
    expect(ctrl).toContain('class CreateInvoiceController')
    expect(ctrl).toContain('async invoke(')
    expect(ctrl).not.toMatch(/\bhandle\s*\(/)
  })

  it('new:resource writes a Resource subclass', () => {
    runCli(root, ['new', 'resource', 'Invoice', '--context=billing', '--module=invoicing', '--aggregate=Invoice'])
    const path = join(root, 'server', 'responses', 'InvoiceResource.ts')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('extends Resource<Invoice>')
    expect(content).toContain('toArray(')
  })

  it('new:listener writes a queued listener when --queued is set', () => {
    runCli(root, [
      'new', 'listener', 'NotifyAdminOfNewInvoice',
      '--context=billing', '--module=invoicing',
      '--event=InvoiceCreated', '--queued', '--queue=mail',
    ])
    const path = join(
      root, 'server', 'contexts', 'billing', 'invoicing', 'application', 'NotifyAdminOfNewInvoice', 'NotifyAdminOfNewInvoice.ts',
    )
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('extends Listener<InvoiceCreated>')
    expect(content).toContain("static readonly QUEUE = 'mail'")
  })

  it('new:policy writes a Policy subclass', () => {
    runCli(root, ['new', 'policy', 'Invoice'])
    const path = join(root, 'server', 'policies', 'InvoicePolicy.policy.ts')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('extends Policy<unknown, unknown>')
    expect(content).toContain('override before(')
  })

  it('new:seeder writes a Seeder subclass', () => {
    runCli(root, ['new', 'seeder', 'DemoInvoice'])
    const path = join(root, 'server', 'database', 'seeders', 'DemoInvoice.seeder.ts')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('class DemoInvoiceSeeder')
    expect(content).toContain('async run()')
  })

  it('new:factory writes a Factory subclass', () => {
    runCli(root, ['new', 'factory', 'Invoice', '--context=billing', '--module=invoicing'])
    const path = join(root, 'server', 'database', 'factories', 'InvoiceFactory.ts')
    const content = readFileSync(path, 'utf8')
    expect(content).toContain('class InvoiceFactory extends Factory<Invoice>')
    expect(content).toContain('protected definition()')
  })
})
