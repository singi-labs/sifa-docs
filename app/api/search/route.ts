import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'

// Static export: the search index is precomputed at build time and
// served as a JSON file. Required because `output: 'export'` can't
// run a server-side search endpoint.
export const dynamic = 'force-static'
export const revalidate = false

export const { staticGET: GET } = createFromSource(source)
