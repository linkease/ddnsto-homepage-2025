/** @type {import('next').NextConfig} */
/* global process -- Next.js sets NODE_ENV for dev/build. */
const nextConfig = {
  output: 'export',
  // Exclude debug routes from the production route graph, not just the UI.
  pageExtensions: process.env.NODE_ENV === 'development'
    ? ['debug.jsx', 'js', 'jsx', 'ts', 'tsx']
    : ['js', 'jsx', 'ts', 'tsx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
