/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.TARGET_DOMAIN}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
