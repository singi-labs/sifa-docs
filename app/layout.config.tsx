import Image from 'next/image'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image
          src="/sifa-logo-light.svg"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 dark:hidden"
        />
        <Image
          src="/sifa-logo-dark.svg"
          alt=""
          width={28}
          height={28}
          className="hidden h-7 w-7 dark:block"
        />
        <span className="font-display text-lg font-bold">Sifa Docs</span>
      </>
    ),
  },
  githubUrl: 'https://github.com/singi-labs/sifa-docs',
  links: [
    {
      text: 'User docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'SDK',
      url: '/docs/sdk',
      active: 'nested-url',
    },
  ],
}
