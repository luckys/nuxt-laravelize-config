import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export type WriteResult = 'created' | 'skipped' | 'overwritten'

export interface WriteOptions {
  readonly force?: boolean
}

export function writeArtifact(path: string, content: string, options: WriteOptions = {}): WriteResult {
  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path) && options.force !== true) return 'skipped'
  const result: WriteResult = existsSync(path) ? 'overwritten' : 'created'
  writeFileSync(path, content)
  return result
}

export function touchDir(path: string): void {
  mkdirSync(path, { recursive: true })
}
