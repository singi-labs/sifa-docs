import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ActivityRegistry } from './components/activity-registry'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ActivityRegistry,
    ...components,
  }
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return getMDXComponents(components)
}
