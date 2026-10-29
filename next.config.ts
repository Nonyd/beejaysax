import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) for the cPanel Node.js host; see docs/DEPLOY.md.
  output: 'standalone',
  // Pin the project root so a stray lockfile in a parent folder can't change the bundle layout.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i3.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // Spotify album art (synced releases)
      { protocol: 'https', hostname: 'i.scdn.co', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  // Security headers live here (not vercel.json) so they also apply on the VPS.
  // For the same header, the later matching rule wins: the camera is allowed only for door check-in.
  async headers() {
    const camera = { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' }
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      { source: '/checkin/:path*', headers: [camera] },
      { source: '/admin/events/:id/checkin', headers: [camera] },
    ]
  },
  compress: true,
}

export default nextConfig
