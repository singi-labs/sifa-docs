import { createMDX } from 'fumadocs-mdx/next'

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true,
}

const withMDX = createMDX()

export default withMDX(config)
