import { join } from 'node:path'

export interface ScopeArgs {
  readonly root: string
  readonly context: string
  readonly module: string
}

export function serverContextRoot(root: string, context: string): string {
  return join(root, 'server', 'contexts', context)
}

export function frontendContextRoot(root: string, context: string): string {
  return join(root, 'app', 'contexts', context)
}

export function moduleRoot({ root, context, module }: ScopeArgs): string {
  return join(serverContextRoot(root, context), module)
}

export function domainFile(scope: ScopeArgs, file: string): string {
  return join(moduleRoot(scope), 'domain', file)
}

export function applicationUseCaseFile(scope: ScopeArgs, useCase: string, file?: string): string {
  return join(moduleRoot(scope), 'application', useCase, file ?? `${useCase}.ts`)
}

export function infrastructureFile(scope: ScopeArgs, file: string): string {
  return join(moduleRoot(scope), 'infrastructure', file)
}

export function controllerFile(root: string, name: string): string {
  return join(root, 'server', 'controllers', `${name}.ts`)
}

export function requestFile(root: string, name: string): string {
  return join(root, 'server', 'requests', `${name}.ts`)
}

export function responseFile(root: string, name: string): string {
  return join(root, 'server', 'responses', `${name}.ts`)
}

export function mailFile(root: string, name: string): string {
  return join(root, 'server', 'mails', `${name}.ts`)
}

export function notificationFile(root: string, name: string): string {
  return join(root, 'server', 'notifications', `${name}.ts`)
}

export function policyFile(root: string, name: string): string {
  return join(root, 'server', 'policies', `${name}.policy.ts`)
}

export function seederFile(root: string, name: string): string {
  return join(root, 'server', 'database', 'seeders', `${name}.seeder.ts`)
}

export function factoryFile(root: string, name: string): string {
  return join(root, 'server', 'database', 'factories', `${name}.ts`)
}
