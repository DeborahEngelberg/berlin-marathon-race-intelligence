/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Uncomment and set for GitHub Pages deployment:
  // basePath: '/berlin-marathon-ops',
  // assetPrefix: '/berlin-marathon-ops/',
};

module.exports = nextConfig;
