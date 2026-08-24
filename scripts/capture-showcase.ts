/**
 * On-demand thumbnail capture for the Sifa-driven sites showcase.
 *
 * Reads content/data/site-showcase.json and, for every entry with a
 * `screenshot` filename, opens the site in headless Chromium and captures the
 * viewport into public/showcase/<screenshot>. Optional `captureActions` run
 * first (e.g. samclemente.me needs its CV tab clicked — there is no deep link).
 *
 * Deliberately NOT wired into a nightly workflow: external sites change and
 * would silently produce broken captures that auto-commit. Run this by hand
 * when you add or refresh a site, eyeball the output, then commit the PNGs.
 *
 *   pnpm capture:showcase            # all entries
 *   pnpm capture:showcase gui-do     # only entries whose screenshot matches
 */
import { mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import type { ShowcaseEntry } from './showcase'
import type { ScreenshotAction } from './screenshot-targets'

const DATA = path.resolve(process.cwd(), 'content/data/site-showcase.json')
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/showcase')
const VIEWPORT = { width: 1200, height: 800 }
const NAV_TIMEOUT_MS = 30_000
// Let late fonts/images/hydration settle after load before the shot.
const SETTLE_MS = 2500

async function runActions(page: Page, actions: ScreenshotAction[]): Promise<void> {
  for (const action of actions) {
    switch (action.type) {
      case 'click':
        await page.click(action.selector, { timeout: 10_000 })
        break
      case 'scroll':
        await page.evaluate((y) => window.scrollTo(0, y), action.y)
        break
      case 'wait':
        await page.waitForSelector(action.selector, { timeout: 10_000 })
        break
      case 'fill':
        await page.fill(action.selector, action.value)
        break
    }
  }
}

async function main(): Promise<void> {
  const filter = process.argv.slice(2)
  const entries = (JSON.parse(readFileSync(DATA, 'utf8')) as ShowcaseEntry[]).filter(
    (e): e is ShowcaseEntry & { screenshot: string } =>
      Boolean(e.screenshot) &&
      (filter.length === 0 || filter.some((f) => e.screenshot!.includes(f)))
  )

  if (entries.length === 0) {
    console.log('No matching entries with a screenshot filename.')
    return
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  // 1x is plenty for a thumbnail shown ~380px wide, and keeps the committed
  // PNGs small (2x quadrupled the repo weight for no visible gain at this size).
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 })

  let ok = 0
  const failed: string[] = []
  for (const entry of entries) {
    const out = path.join(OUTPUT_DIR, entry.screenshot)
    const page = await context.newPage()
    try {
      await page.goto(entry.url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS })
      if (entry.captureActions) await runActions(page, entry.captureActions)
      await page.waitForTimeout(SETTLE_MS)
      await page.screenshot({ path: out }) // viewport only, not full page
      console.log(`✅ ${entry.label} → public/showcase/${entry.screenshot}`)
      ok++
    } catch (err) {
      console.error(`❌ ${entry.label} — ${(err as Error).message.split('\n')[0]}`)
      failed.push(entry.label)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  console.log(
    `\n${ok}/${entries.length} captured.${failed.length ? ` Failed: ${failed.join(', ')}` : ''}`
  )
  if (failed.length > 0) process.exit(1)
}

void main()
