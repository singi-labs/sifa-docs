/**
 * Compares each newly-captured PNG in public/screenshots/ against the version
 * currently in git (HEAD). Decides per spec:
 *
 *   0%       -> revert (don't even commit)
 *   0–1.5%   -> overwrite silently (commit directly to main)
 *   > 1.5%   -> meaningful change (open PR)
 *
 * Outputs to $GITHUB_OUTPUT:
 *   changed=true|false      meaningful change (any file > threshold OR new file)
 *   silent=true|false       any sub-threshold change worth committing silently
 *   date=YYYY-MM-DD         used for PR title
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const THRESHOLD_PCT = 1.5
const PIXEL_THRESHOLD = 0.1

const SCREENSHOTS_DIR = 'public/screenshots'

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function listChangedPngs(): { modified: string[]; added: string[] } {
  // --porcelain output: " M path", "?? path", "A  path"
  const out = git('status', '--porcelain', '--', SCREENSHOTS_DIR)
  const modified: string[] = []
  const added: string[] = []
  for (const line of out.split('\n').filter(Boolean)) {
    const status = line.slice(0, 2)
    const file = line.slice(3).trim()
    if (!file.endsWith('.png')) continue
    if (status.includes('?')) added.push(file)
    else if (status.includes('M')) modified.push(file)
    else if (status.includes('A')) added.push(file)
  }
  return { modified, added }
}

function readPng(file: string): PNG {
  return PNG.sync.read(readFileSync(file))
}

function readPngFromHead(file: string): PNG | null {
  try {
    const buf = execFileSync('git', ['show', `HEAD:${file}`], {
      maxBuffer: 64 * 1024 * 1024,
    })
    return PNG.sync.read(buf)
  } catch {
    return null
  }
}

interface DiffResult {
  file: string
  pctChanged: number
  diffPath: string | null
}

function diffOne(file: string): DiffResult {
  const current = readPng(file)
  const previous = readPngFromHead(file)
  if (!previous) {
    return { file, pctChanged: 100, diffPath: null }
  }
  if (current.width !== previous.width || current.height !== previous.height) {
    return { file, pctChanged: 100, diffPath: null }
  }
  const { width, height } = current
  const diff = new PNG({ width, height })
  const changed = pixelmatch(previous.data, current.data, diff.data, width, height, {
    threshold: PIXEL_THRESHOLD,
  })
  const pct = (changed / (width * height)) * 100
  let diffPath: string | null = null
  if (pct > THRESHOLD_PCT) {
    diffPath = file.replace(/\.png$/, '.diff.png')
    writeFileSync(diffPath, PNG.sync.write(diff))
  }
  return { file, pctChanged: pct, diffPath }
}

function setOutput(key: string, value: string): void {
  const out = process.env.GITHUB_OUTPUT
  if (out) {
    writeFileSync(out, `${key}=${value}\n`, { flag: 'a' })
  }
  console.log(`::set-output name=${key}::${value}`)
}

function main(): void {
  const { modified, added } = listChangedPngs()
  let meaningful = false
  let silent = false

  for (const file of modified) {
    const res = diffOne(file)
    console.log(`${file}: ${res.pctChanged.toFixed(3)}% changed`)
    if (res.pctChanged === 0) {
      git('checkout', '--', file)
      console.log(`  reverted (0%)`)
    } else if (res.pctChanged > THRESHOLD_PCT) {
      meaningful = true
    } else {
      silent = true
    }
  }
  for (const file of added) {
    if (existsSync(file)) {
      meaningful = true
      console.log(`${file}: NEW (treated as meaningful)`)
    }
  }

  const date = new Date().toISOString().slice(0, 10)
  setOutput('changed', meaningful ? 'true' : 'false')
  setOutput('silent', silent && !meaningful ? 'true' : 'false')
  setOutput('date', date)
}

main()

// Avoid unused-import warning in some toolchains.
export const _entry = path.basename(import.meta.url)
