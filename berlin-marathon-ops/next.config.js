/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/berlin-marathon-race-intelligence',
  assetPrefix: '/berlin-marathon-race-intelligence/',
};

module.exports = nextConfig;
