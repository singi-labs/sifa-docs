import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'

interface Props {
  /**
   * Path to the example file, relative to the repo's examples/ directory.
   * For example: "01-fetch-activity-tiers.ts".
   */
  path: string
  /**
   * Override the syntax-highlighting language. Defaults to inferring from
   * the file extension.
   */
  lang?: string
}

/**
 * Renders an example .ts file from the examples/ directory as a syntax-
 * highlighted code block at build time. The file content is read from disk
 * during the React Server Component render; nothing happens client-side.
 *
 * Examples are typechecked against the pinned sifa-sdk version on every
 * CI run (`pnpm examples:typecheck`), so the snippets on the page can't
 * silently rot.
 */
export async function Example({ path, lang }: Props) {
  const filePath = join(process.cwd(), 'examples', path)
  const source = await readFile(filePath, 'utf8')

  const inferredLang =
    lang ??
    (path.endsWith('.ts')
      ? 'ts'
      : path.endsWith('.tsx')
        ? 'tsx'
        : path.endsWith('.mjs') || path.endsWith('.js')
          ? 'js'
          : 'text')

  return (
    <CodeBlock>
      <Pre>
        <code className={`language-${inferredLang}`}>{source}</code>
      </Pre>
    </CodeBlock>
  )
}
