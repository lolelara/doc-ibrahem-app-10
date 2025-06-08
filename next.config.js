/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true
  },
  experimental: {
    turbotrace: {
      memoryLimit: 4096
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!',
    DATABASE_URL: process.env.DATABASE_URL
  }
}

module.exports = nextConfig 