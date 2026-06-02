import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ActivityRegistry } from './components/activity-registry'
import { Example } from './components/example'
import { Screenshot } from './components/screenshot'
import { SdkColors } from './components/sdk-colors'
import { SdkVersion } from './components/sdk-version'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ActivityRegistry,
    Example,
    Screenshot,
    SdkColors,
    SdkVersion,
    ...components,
  }
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return getMDXComponents(components)
}
