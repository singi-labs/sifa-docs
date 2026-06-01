# Sifa Docs -- Documentation Site

<!-- Auto-generated from sifa-workspace. To propose changes, edit the source:
     https://github.com/singi-labs/sifa-workspace -->

MIT (code) / CC BY-SA 4.0 (content) | Part of [github.com/singi-labs](https://github.com/singi-labs)

Documentation site for Sifa at docs.sifa.id. Built with Fumadocs (Next.js).

## Tech Stack

| Component | Technology                                           |
| --------- | ---------------------------------------------------- |
| Framework | Fumadocs (Next.js 16 / React 19 / TypeScript strict) |
| Styling   | TailwindCSS                                          |
| Output    | Static export (zero server runtime)                  |

API reference (fumadocs-openapi) and TypeScript type docs (fumadocs-typescript) will be added when the corresponding surfaces are public.

## What This Repo Does

- User-facing documentation for Sifa features that are too opinionated to explain inline (activity feed allow-list, Adam feeds, Standard.site cards, etc.)
- Deep links from sifa-web "Read more" affordances land here
- Designed to be indexable by LLM agents (clean semantic HTML, sitemap, llms.txt planned)

## Docs-Specific Standards

- Strict TypeScript -- `strict: true`, no `any`, no `@ts-ignore`
- Accessibility -- WCAG 2.2 AA, semantic HTML
- Static export -- all pages pre-rendered at build time, zero client JS where possible
- Code-anchored content -- pages that describe behavior (allow-lists, filter rules) should import canonical data from sifa-sdk at build time rather than restate it in prose. Drift between code and docs is treated as a CI failure.
