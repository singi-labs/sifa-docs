import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ActivityRegistry } from './components/activity-registry'
import { SifaDrivenSites } from './components/sifa-driven-sites'
import { SupportedApps } from './components/supported-apps'
import { Example } from './components/example'
import { Msg } from './components/msg'
import { Screenshot } from './components/screenshot'
import { SdkColors } from './components/sdk-colors'
import { SdkIconWeights } from './components/sdk-icon-weights'
import { SdkTypography } from './components/sdk-typography'
import { SdkVersion } from './components/sdk-version'
import { Video } from './components/video'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ActivityRegistry,
    SifaDrivenSites,
    SupportedApps,
    Example,
    Msg,
    Screenshot,
    SdkColors,
    SdkIconWeights,
    SdkTypography,
    SdkVersion,
    Video,
    ...components,
  }
}

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return getMDXComponents(components)
}
