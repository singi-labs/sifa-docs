# Contributing to sifa-docs

This is the human-readable contributor guide for docs.sifa.id. If you're an AI assistant, `CLAUDE.md` has the same content distilled into instructions. If you're a maintainer looking for the strategic context (why Fumadocs, why one site with tabs, why CSP is shaped the way it is), the workspace decision log at `~/Documents/CoreNotes/Workspaces/Sifa/decisions/2026-06-02-docs-site.md` is the source.

## Local dev

Prerequisites: Node 24, pnpm 10. If you don't have pnpm, use `npx pnpm@10.29` for everything (it's what CI uses).

```bash
git clone https://github.com/singi-labs/sifa-docs.git
cd sifa-docs
npx pnpm@10.29 install
pnpm dev   # http://localhost:3000
```

The dev server hot-reloads on MDX and component edits.

Useful scripts:

```bash
pnpm build               # static export into out/
pnpm lint                # eslint
pnpm format              # prettier --write .
pnpm format:check        # prettier --check . (what CI runs)
pnpm typecheck           # tsc --noEmit on the Next.js code
pnpm examples:typecheck  # tsc --noEmit on examples/*.ts against the pinned SDK
pnpm screenshots:capture # run the Playwright pipeline (requires SCREENSHOT_HANDLE + SCREENSHOT_PASSWORD env vars)
```

## Adding a doc page

Three steps:

### 1. Write the MDX

Create the file under `content/docs/`:

- User docs (most pages): `content/docs/<slug>.mdx`
- SDK reference: `content/docs/sdk/<slug>.mdx` or `content/docs/sdk/reference/<slug>.mdx`

Frontmatter every page needs:

```mdx
---
title: Short page title
description: One sentence. Used as <meta name="description"> and og:description. Plain text only — no markdown links here, they render literal in meta tags.
---

Body content in MDX.
```

### 2. Add the page to the sidebar

Open the relevant `meta.json`:

- User docs sidebar: `content/docs/meta.json`
- SDK sidebar: `content/docs/sdk/meta.json`

Insert your slug at the right group. Section headers use the `---Group name---` format:

```json
{
  "pages": [
    "index",
    "---Getting started---",
    "create-account",
    "your-new-page",
    "---Features---",
    "..."
  ]
}
```

### 3. Link first mentions of external entities

Every external PDS, app, tool, or spec mentioned in body prose gets a markdown link on its **first** mention per page. Subsequent mentions stay bare for readability. Frontmatter `description:` fields stay link-free.

Canonical-URL table for the entities that show up most often:

| Entity                                                               | URL                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| AT Protocol                                                          | https://atproto.com                                         |
| Atmosphere (general intro)                                           | https://atmosphereaccount.com                               |
| Bluesky                                                              | https://bsky.app                                            |
| Eurosky                                                              | https://eurosky.social                                      |
| Tangled                                                              | https://tangled.org                                         |
| Blacksky                                                             | https://blacksky.community                                  |
| Leaflet                                                              | https://leaflet.pub                                         |
| WhiteWind                                                            | https://whtwnd.com                                          |
| Smoke Signal                                                         | https://smokesignal.events                                  |
| Offprint                                                             | https://offprint.pub                                        |
| pckt.blog                                                            | https://pckt.blog                                           |
| pdsls.dev                                                            | https://pdsls.dev                                           |
| PDSmoover                                                            | https://pdsmoover.com                                       |
| goat CLI                                                             | https://github.com/bluesky-social/indigo/tree/main/cmd/goat |
| Standard.site                                                        | https://standard.site                                       |
| ORCID                                                                | https://orcid.org                                           |
| Keyoxide                                                             | https://keyoxide.org                                        |
| Substack                                                             | https://substack.com                                        |
| Mastodon                                                             | https://joinmastodon.org                                    |
| NetNewsWire, Reeder, Feedly, Inoreader, FreshRSS, Miniflux, NewsBlur | (see existing pages for URLs)                               |

If you mention an entity not in this table, look up the canonical URL and link the first mention. Don't invent URLs; if you can't verify, leave the term bare and flag it in PR review.

GitHub deliberately stays unlinked (too ubiquitous).

## Adding an MDX component

The site uses a few build-time components to anchor docs to source of truth instead of hand-maintained text. Examples already in tree:

- `<ActivityRegistry tier="creation" />` — renders the `ACTIVITY_TIERS` taxonomy from `@singi-labs/sifa-sdk` as a table.
- `<SdkVersion />` — renders the currently-pinned SDK version from `package.json`.
- `<SdkColors />` — renders the brand-color tokens from `@singi-labs/sifa-sdk/tokens`.
- `<SdkTypography />` — renders the font tokens.
- `<SdkIconWeights />` — renders the icon-weight convention.
- `<Example path="01-fetch-activity-tiers.ts" />` — reads an example file from `examples/` and renders it as a syntax-highlighted code block.
- `<Screenshot src caption alt />` — renders a Playwright-captured screenshot from `public/screenshots/`.

To add a new component:

1. Write the component under `components/<name>.tsx`. React Server Component is the default; client-side state needs `'use client'` at the top.
2. Register it in `mdx-components.tsx`:

   ```tsx
   import { MyComponent } from './components/my-component'

   export function getMDXComponents(components?: MDXComponents): MDXComponents {
     return {
       ...defaultMdxComponents,
       MyComponent,
       // ...existing components...
       ...components,
     }
   }
   ```

3. Use it from any MDX file: `<MyComponent />`.

If your component reads from `sifa-sdk` or any other dependency, use the structural-anchor pattern: import the live data at build time, render it directly. Don't hand-write what the SDK can tell you.

## Adding a code example

Examples under `examples/` are real TypeScript files. They get typechecked against the pinned SDK on every CI run (`pnpm examples:typecheck`), so a breaking change in the SDK fails the docs build before stale examples can ship.

1. Add `examples/<NN>-<short-description>.ts`.
2. Make sure it imports from `@singi-labs/sifa-sdk` (or a subpath) rather than redefining types.
3. End with a "side effect" line if needed (`void someFunctionThatHasToBeReachable`) so unused-locals lint passes.
4. Reference it from MDX with `<Example path="<NN>-<short-description>.ts" />`.

If the example needs a type the SDK exports under an unusual name, add a re-export to `examples/sdk-types.ts` so future renames in the SDK fail loudly.

The pattern is: **don't write code blocks by hand in MDX**. Write them as `.ts` files, let CI watch them.

## Adding a tutorial screenshot

The full four-step workflow lives in `CLAUDE.md` because it has cross-PR ordering that's easy to mess up. Summary:

1. Decide what deserves a shot (skip auth-gated, third-party UI, unstable surfaces).
2. Add a target to `scripts/screenshot-targets.ts` and merge that PR first.
3. Run `gh workflow run screenshots.yml -R singi-labs/sifa-docs`. The bot opens a `chore(screenshots)` PR with the new PNG. Eyeball, merge.
4. Open a second PR adding the `<Screenshot src="..." alt="..." caption="..." />` reference in MDX.

Don't bundle target + embed in one PR. The embed will fail validation (`scripts/validate-screenshot-refs.ts`) until the PNG lands on main.

## The two tabs

`content/docs/meta.json` is the User docs sidebar.
`content/docs/sdk/meta.json` has `"root": true` set, which makes the SDK section its own sidebar context when the URL is `/docs/sdk/*`.

Top-nav switcher between the two tabs is in `app/layout.config.tsx`'s `links` array. If you add a third tab, mirror the pattern: a folder with `root: true` in its `meta.json` plus a `links` entry.

## Voice and style

External-audience MDX pages on docs.sifa.id (anything under `content/docs/`) are humanizer-required: every draft passes through the [humanizer skill](https://github.com/blader/humanizer) (or its equivalent in this workspace) before merge. The rule is "draft → humanizer → ship", not "ship and pass through humanizer later".

Tight constraints worth knowing:

- **No em-dashes** (`—`) anywhere. Use a colon, comma, semicolon, or restructure. CI does not enforce this; reviewers should.
- **No AI-trope phrases**: avoid "It's not just X, it's Y", "didn't just...also", "isn't X. It's Y", "Here's the thing", "Let me tell you", "In conclusion".
- **No throat-clearing**: if a sentence's only job is to announce what comes next, delete it.
- **Contractions throughout**: "I'm", "don't", "it's", "you're". Never spell out.
- **Hedges for predictions, direct for principles**: "I think this might break" but "This breaks. Fix it."
- **AT Protocol terminology**: use "AT Protocol" (preferred public form), "atproto" (lowercase, dev contexts), or "Atmosphere" (ecosystem name). Never "ATproto" / "ATProtocol" / "atmosphere" lowercase.

Full reference: `~/Documents/CoreNotes/Workspaces/writing/writing-style-2.md`.

## CI checks you'll hit

Every PR runs these (in order):

1. `pnpm format:check` — prettier 3.8.1, strict.
2. `pnpm build` — Next.js static export. Fails if any route handler under `app/` lacks `export const dynamic = 'force-static'`.
3. `pnpm lint` — eslint. Fails on unescaped apostrophes in JSX (`react/no-unescaped-entities`); use `&apos;`.
4. `pnpm examples:typecheck` — `tsc --noEmit` against `examples/tsconfig.json`. Fails if any `.ts` file under `examples/` doesn't compile against the pinned SDK.

Deploy CI runs the same plus rsync to sifa-prod after merge to main.

## Deploy

Push to main → GitHub Actions builds + rsyncs to `/var/www/docs.sifa.id/` on sifa-prod → Caddy serves the new files. Typically 1 to 2 minutes from merge to live.

Verify after a change:

```bash
curl -sSI https://docs.sifa.id/<your-route>/   # 200
curl -sS https://docs.sifa.id/<your-route>/ | grep -i 'your change here'
```

For visual changes, open the page in a browser (incognito to avoid cache) or run:

```bash
gh workflow run screenshots.yml -R singi-labs/sifa-docs   # if your change wants new screenshots
```

## Common gotchas

| Symptom                                                        | Fix                                                                                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react/no-unescaped-entities` lint error                       | Replace `'` with `&apos;` in the JSX text                                                                                                                   |
| `export const dynamic = "force-static"...not configured`       | Add `export const dynamic = 'force-static'` to the new route handler                                                                                        |
| Frontmatter description shows `[Foo](url)` literally on Google | Strip markdown links from frontmatter — use plain text only                                                                                                 |
| Live site shows old content                                    | HTML caches for 5 min. Hard-refresh, or wait                                                                                                                |
| Dark mode breaks                                               | CSP got tightened; restore `'unsafe-inline'` in script-src on the Caddyfile (see `~/Documents/CoreNotes/Workspaces/Sifa/decisions/2026-06-02-docs-site.md`) |
| 404 page renders Next.js stock instead of the Sifa-branded one | Confirm `app/not-found.tsx` is in tree and the Caddyfile has the `handle_errors` block                                                                      |
| Lockfile mismatch in CI                                        | `npx pnpm@10.29 install` locally and commit `pnpm-lock.yaml`; the system pnpm 11 strips overrides                                                           |

## When sifa-sdk publishes a new version

You'll get an auto-opened PR on sifa-docs titled `chore(deps): bump @singi-labs/sifa-sdk to X.Y.Z`. CI on that PR runs both typechecks against the new SDK. If green, just merge. If red, the breaking change in the SDK needs accommodating in `examples/` or in MDX content. Fix forward on the bump branch; don't roll back the SDK.

The dispatch loop is documented in `~/Documents/CoreNotes/Workspaces/Sifa/infrastructure/docs-sifa-id.md`.

## Related files in this repo

| File              | Audience           | What it covers                                                            |
| ----------------- | ------------------ | ------------------------------------------------------------------------- |
| `README.md`       | Public / npm       | Project description and links                                             |
| `AGENTS.md`       | AI agents (public) | Minimal pointer file                                                      |
| `CLAUDE.md`       | Claude Code        | Operational rules (screenshots, force-static, CSP, first-mention linking) |
| `CONTRIBUTING.md` | Humans             | This file                                                                 |
