# CLAUDE.md — sifa-docs

Repo-specific implementer notes for Claude Code. Workspace-wide Sifa rules
live in `~/SingiSync/Sifa/CLAUDE.md`.

## Screenshot workflow

`docs.sifa.id` uses an automated Playwright pipeline to keep tutorial
screenshots fresh. The pipeline is editorial — new pages don't get
screenshots automatically. When you add or revise a tutorial page, walk
through these four steps.

### 1. Decide what deserves a shot

Apply these tests, in order:

- **Does a paragraph instruct the reader to click, navigate, or fill
  something?** If yes, picture probably helps. If no, skip.
- **Is the surface signed-out?** Auth-gated screens (`/import`,
  `/settings`, the profile editor) are out until we add Playwright
  `storageState` plumbing. Don't add auth-gated targets.
- **Is it stable?** A screen that re-flows on every release (feature
  flags, dynamic counters) will fire the bot PR every night. Either
  clip to a stable sub-region or skip.
- **Is it ours?** Don't screenshot third-party UI (Bluesky OAuth screen,
  LinkedIn export page, PDSmoover). They rot outside our control and
  legally we shouldn't redistribute them.

### 2. Add a target to `scripts/screenshot-targets.ts`

Each entry is one PNG. Verify the URL is reachable (`curl -sI`) and the
selector exists in sifa-web (`grep -rn 'data-section\|id="..."'
~/SingiSync/Sifa/sifa-web/src`) before adding. Use `clip` to scope the
shot to a stable sub-region whenever possible — it reduces visual-diff
churn.

```ts
{
  name: 'thing-being-shown',         // matches <Screenshot src="thing-being-shown.png">
  url: 'https://sifa.id/some/path',  // `{{handle}}` interpolates DEMO_HANDLE
  actions: [{ type: 'wait', selector: '#my-panel' }],
  clip: '#my-panel',
}
```

The current `DEMO_HANDLE` is `gui.do`. Change only if the demo profile
moves; updating the handle re-generates every profile-related shot.

### 3. Embed `<Screenshot>` in the MDX

```mdx
<Screenshot
  src="thing-being-shown.png"
  alt="Dense factual description for screen readers. Name what's on the screen, not what the reader should do with it."
  caption="One short sentence explaining what the picture demonstrates."
/>
```

The component lives in `components/screenshot.tsx` and is registered in
`mdx-components.tsx`. `src` matches the target's `name` plus `.png`.

Alt text is for accessibility — describe the image factually. Caption is
editorial — tie it to the surrounding paragraph.

### 4. Capture + ship

1. Open one PR with the `targets.ts` change.
2. After merge, `gh workflow run screenshots.yml -R singi-labs/sifa-docs`.
3. The bot opens a `chore(screenshots)` PR with the new PNG. Eyeball,
   merge.
4. Open a second PR adding the MDX embed (now that the file exists on
   main, the `<Screenshot>` reference resolves at build time).

Don't bundle target + embed in one PR — the embed will fail validation
(see `scripts/validate-screenshot-refs.ts`) until the PNG lands on main.

## Other notes

- **Static export:** every `app/*/route.ts`, `sitemap.ts`, `robots.ts`,
  `manifest.ts`, `apple-icon.tsx`, `opengraph-image.tsx` must
  `export const dynamic = 'force-static'` or the build fails. See
  workspace memory `sifa-docs-static-export-route-handlers`.
- **CSP `unsafe-inline`:** the Caddyfile keeps `'unsafe-inline'` in
  `script-src`; removing it breaks theme detection and RSC hydration.
  See memory `sifa-docs-csp-nextjs-inline-scripts`.
- **First-mention linking:** every doc page links the first body mention
  of external PDSes / apps / tools / specs. See memory
  `sifa-docs-first-mention-linking`.
