<div align="center">

# Sifa Docs

**Documentation site for Sifa, the decentralized professional network on the AT Protocol.**

[![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)]()
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-24%20LTS-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)

</div>

---

## Overview

User and (eventually) developer documentation for [Sifa](https://sifa.id), hosted at [docs.sifa.id](https://docs.sifa.id). Built with [Fumadocs](https://fumadocs.vercel.app/) (Next.js).

---

## Tech Stack

| Component | Technology                                           |
| --------- | ---------------------------------------------------- |
| Framework | Fumadocs (Next.js 16 / React 19 / TypeScript strict) |
| Styling   | TailwindCSS                                          |
| Output    | Static export (zero server runtime)                  |

API reference (auto-generated from OpenAPI spec) and TypeScript type docs (auto-generated from `@singi-labs/sifa-sdk`) will be added when those surfaces are public.

---

## Documentation Sections

Initial scope:

| Section             | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Activity feed       | What Sifa shows on your profile and why (opinionated allow-list) |
| Adam feeds          | Curated feeds and how to block topics                            |
| Standard.site cards | Configure rich link cards for your site on AT Protocol apps      |

---

## Quick Start

Prerequisites: Node.js 24 LTS, pnpm 10.

```bash
git clone https://github.com/singi-labs/sifa-docs.git
cd sifa-docs
pnpm install
pnpm dev
```

---

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Static export
pnpm lint         # ESLint
pnpm typecheck    # TypeScript strict mode
pnpm format       # Prettier write
```

See [CONTRIBUTING.md](https://github.com/singi-labs/.github/blob/main/CONTRIBUTING.md) for contribution guidelines.

---

## Related Repositories

| Repository                                                     | Description                                    | License |
| -------------------------------------------------------------- | ---------------------------------------------- | ------- |
| [sifa-api](https://github.com/singi-labs/sifa-api)             | AppView backend (private)                      | —       |
| [sifa-web](https://github.com/singi-labs/sifa-web)             | Frontend (private)                             | —       |
| [sifa-sdk](https://github.com/singi-labs/sifa-sdk)             | Public TypeScript SDK (`@singi-labs/sifa-sdk`) | MIT     |
| [sifa-lexicons](https://github.com/singi-labs/sifa-lexicons)   | AT Protocol schemas (`id.sifa.*`)              | MIT     |
| [sifa-workspace](https://github.com/singi-labs/sifa-workspace) | Issue tracker and project coordination         | —       |

---

## Community

- **Website:** [sifa.id](https://sifa.id)
- **Issues:** [Report bugs](https://github.com/singi-labs/sifa-docs/issues)

---

## License

This repository uses a dual license:

**Content** (MDX documentation files in `content/`): **CC BY-SA 4.0**

**Code** (Fumadocs configuration, components, layouts, build scripts): **MIT**

See [LICENSE](LICENSE) for the content license and [LICENSE-CODE](LICENSE-CODE) for the code license.

---

Made with ♥ in 🇪🇺 by [Singi Labs](https://singi.dev)
