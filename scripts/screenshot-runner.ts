/**
 * Playwright runner. Captures each target in scripts/screenshot-targets.ts
 * into public/screenshots/. The diff step decides what to do with the result.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import {
  DEFAULT_VIEWPORT,
  targets,
  type ScreenshotAction,
  type ScreenshotTarget,
} from './screenshot-targets'

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/screenshots')

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function interpolate(url: string, vars: Record<string, string>): string {
  return url.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key]
    if (v === undefined) {
      throw new Error(`Unknown template var {{${key}}} in URL ${url}`)
    }
    return v
  })
}

async function signIn(page: Page, handle: string, password: string): Promise<void> {
  await page.goto('https://sifa.id/login', { waitUntil: 'load' })
  await page.fill('input[name="handle"], input[type="text"]', handle)
  await page.click('button[type="submit"]')
  // OAuth handoff to PDS — Bluesky login form.
  await page.waitForURL(/bsky\.social|pds|atproto/i, { timeout: 30_000 })
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('https://sifa.id/**', { timeout: 60_000 })
}

async function runActions(page: Page, actions: ScreenshotAction[]): Promise<void> {
  for (const action of actions) {
    switch (action.type) {
      case 'click':
        await page.click(action.selector)
        break
      case 'scroll':
        await page.evaluate((y) => window.scrollTo(0, y), action.y)
        break
      case 'wait':
        await page.waitForSelector(action.selector)
        break
      case 'fill':
        await page.fill(action.selector, action.value)
        break
    }
  }
}

async function captureOne(
  context: BrowserContext,
  target: ScreenshotTarget,
  templateVars: Record<string, string>
): Promise<void> {
  const viewport = target.viewport ?? DEFAULT_VIEWPORT
  const page = await context.newPage()
  await page.setViewportSize(viewport)
  await page.emulateMedia({ colorScheme: target.scheme ?? 'light' })

  const url = interpolate(target.url, templateVars)
  await page.goto(url, { waitUntil: 'load' })
  if (target.actions) {
    await runActions(page, target.actions)
  }
  // Settle layout/animations.
  await page.waitForTimeout(500)

  const outPath = path.join(OUTPUT_DIR, `${target.name}.png`)
  if (target.clip) {
    const handle = await page.waitForSelector(target.clip, { timeout: 10_000 })
    await handle.screenshot({ path: outPath })
  } else {
    await page.screenshot({ path: outPath, fullPage: false })
  }
  await page.close()
  console.log(`captured ${target.name} -> ${path.relative(process.cwd(), outPath)}`)
}

async function main(): Promise<void> {
  const handle = requireEnv('SCREENSHOT_HANDLE')
  const password = requireEnv('SCREENSHOT_PASSWORD')
  await mkdir(OUTPUT_DIR, { recursive: true })

  let browser: Browser | null = null
  try {
    browser = await chromium.launch()
    // One context for unauthenticated targets.
    const anonContext = await browser.newContext()
    // One context for authenticated targets — sign in once, reuse.
    const authContext = await browser.newContext()
    const signInPage = await authContext.newPage()
    await signIn(signInPage, handle, password)
    await signInPage.close()

    const templateVars = { handle }
    for (const target of targets) {
      const ctx = target.authenticated ? authContext : anonContext
      try {
        await captureOne(ctx, target, templateVars)
      } catch (err) {
        console.error(`FAILED ${target.name}:`, err)
        throw err
      }
    }
  } finally {
    await browser?.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
