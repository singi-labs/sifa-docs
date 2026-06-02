/**
 * Playwright runner. Captures each target in scripts/screenshot-targets.ts
 * into public/screenshots/. The diff step decides what to do with the result.
 *
 * v1 captures signed-out surfaces only. If a gated-flow screenshot is needed
 * later, restore a Playwright storageState from a SCREENSHOT_AUTH_STATE
 * secret rather than putting a password in CI.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium, type Browser, type BrowserContext } from 'playwright'
import {
  DEFAULT_VIEWPORT,
  DEMO_HANDLE,
  targets,
  type ScreenshotAction,
  type ScreenshotTarget,
} from './screenshot-targets'

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/screenshots')

function interpolate(url: string, vars: Record<string, string>): string {
  return url.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key]
    if (v === undefined) {
      throw new Error(`Unknown template var {{${key}}} in URL ${url}`)
    }
    return v
  })
}

async function runActions(
  page: Awaited<ReturnType<BrowserContext['newPage']>>,
  actions: ScreenshotAction[]
): Promise<void> {
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
  await mkdir(OUTPUT_DIR, { recursive: true })

  let browser: Browser | null = null
  try {
    browser = await chromium.launch()
    const context = await browser.newContext()
    const templateVars = { handle: DEMO_HANDLE }
    for (const target of targets) {
      try {
        await captureOne(context, target, templateVars)
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
