/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn.shopify.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
