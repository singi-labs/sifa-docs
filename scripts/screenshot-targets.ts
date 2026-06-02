export type ScreenshotAction =
  | { type: 'click'; selector: string }
  | { type: 'scroll'; y: number }
  | { type: 'wait'; selector: string }
  | { type: 'fill'; selector: string; value: string }

export interface ScreenshotTarget {
  /** Output filename in public/screenshots/, no extension. */
  name: string
  /** Absolute URL to navigate to. `{{handle}}` is substituted with DEMO_HANDLE. */
  url: string
  /** Viewport size. Defaults to 1280×800. */
  viewport?: { width: number; height: number }
  /** Color scheme. Defaults to light. */
  scheme?: 'light' | 'dark'
  /** Pre-capture interactions. */
  actions?: ScreenshotAction[]
  /** CSS selector to clip the screenshot to. Omit for full viewport. */
  clip?: string
}

export const DEFAULT_VIEWPORT = { width: 1280, height: 800 } as const

/**
 * Stable public Sifa handle used in screenshots that show a profile.
 * Picked because the profile is real, public, and unlikely to be deleted.
 * Change here to swap to a different demo profile.
 */
export const DEMO_HANDLE = 'gui.do'

export const targets: ScreenshotTarget[] = [
  {
    name: 'sifa-homepage',
    url: 'https://sifa.id/',
  },
  {
    name: 'login-page',
    url: 'https://sifa.id/login',
  },
  {
    name: 'public-profile',
    url: 'https://sifa.id/p/{{handle}}',
  },
  {
    name: 'public-profile-activity-feed',
    url: 'https://sifa.id/p/{{handle}}/activity',
    actions: [{ type: 'wait', selector: '#activity-feed-panel' }],
    clip: '#activity-feed-panel',
  },
]
