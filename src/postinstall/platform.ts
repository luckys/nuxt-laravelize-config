import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readlinkSync,
  rmSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname } from 'node:path'

export type LinkResult = 'linked' | 'copied' | 'noop' | 'conflict' | 'rewritten'

export interface LinkOptions {
  readonly force?: boolean
  readonly allowCopyFallback?: boolean
  readonly contentForCopy?: string
  readonly writeContentInsteadOfLink?: boolean
}

export function linkFile(target: string, dest: string, options: LinkOptions = {}): LinkResult {
  mkdirSync(dirname(dest), { recursive: true })
  const { force = false, allowCopyFallback = true, contentForCopy, writeContentInsteadOfLink = false } = options

  if (existsSync(dest)) {
    const stat = lstatSync(dest)
    if (stat.isSymbolicLink()) {
      const current = safeReadlink(dest)
      if (current === target && !writeContentInsteadOfLink) return 'noop'
      rmSync(dest)
    } else if (force) {
      rmSync(dest)
    } else {
      return 'conflict'
    }
  }

  if (writeContentInsteadOfLink && contentForCopy !== undefined) {
    writeFileSync(dest, contentForCopy)
    return 'copied'
  }

  try {
    symlinkSync(target, dest, 'file')
    return 'linked'
  } catch {
    if (!allowCopyFallback) throw new Error(`Could not link ${dest} to ${target}`)
    if (contentForCopy !== undefined) writeFileSync(dest, contentForCopy)
    else copyFileSync(target, dest)
    return 'copied'
  }
}

export function safeReadlink(path: string): string | null {
  try {
    return readlinkSync(path)
  } catch {
    return null
  }
}

export function unlinkIfExists(path: string): boolean {
  if (!existsSync(path) && safeReadlink(path) === null) return false
  rmSync(path, { force: true })
  return true
}

export function removeDirIfEmpty(dir: string): boolean {
  if (!existsSync(dir)) return false
  try {
    if (readdirSync(dir).length === 0) {
      rmdirSync(dir)
      return true
    }
  } catch {
    return false
  }
  return false
}
