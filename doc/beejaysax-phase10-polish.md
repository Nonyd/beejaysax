# 🎷 BEEJAY SAX — Phase 10: Final Polish, SEO, Performance & Deployment
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## CONTEXT

You are completing the BeeJay Sax website. All phases are done:
- ✅ Phase 1–8: Public pages (home, events, releases, gallery, about, contact)
- ✅ Phase 9A: Ticket purchase + QR code + ticket view page + Resend email
- ✅ Phase 9B: Admin panel, NextAuth, events/releases CRUD, gallery, messages, QR scanner

**THIS PROMPT HANDLES:**
1. Loading skeletons for all data-fetching pages
2. Error boundaries and custom error pages
3. Not-found (404) page
4. Full SEO metadata on every page
5. Performance: image optimization, font preloading, bundle hints
6. Vercel deployment config
7. Final QoL fixes: back-to-top button, smooth page transitions, mobile nav polish

**CREATE ALL FILES COMPLETELY. Do not stop between files. Do not ask for confirmation. Just build.**

---

## PART 1 — LOADING SKELETONS

---

### `app/loading.tsx` (global loading fallback)

```tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center">
        <div
          style={{
            width: 48,
            height: 48,
            border: '2px solid #1E1E1E',
            borderTop: '2px solid #C9A84C',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="section-label mt-6">Loading</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
```

---

### `components/ui/Skeleton.tsx`

```tsx
interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #111 25%, #1A1A1A 50%, #111 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function EventCardSkeleton() {
  return (
    <div className="bg-[#0F0F0F] border border-[#1E1E1E]">
      <Skeleton style={{ aspectRatio: '16/9', width: '100%' }} />
      <div className="p-6 space-y-3">
        <Skeleton style={{ height: 28, width: '75%' }} />
        <Skeleton style={{ height: 16, width: '50%' }} />
        <Skeleton style={{ height: 16, width: '40%' }} />
        <Skeleton style={{ height: 40, width: '100%', marginTop: 16 }} />
      </div>
    </div>
  )
}

export function ReleaseCardSkeleton() {
  return (
    <div className="bg-[#0F0F0F] border border-[#1E1E1E]">
      <Skeleton style={{ aspectRatio: '1/1', width: '100%' }} />
      <div className="p-4 space-y-2">
        <Skeleton style={{ height: 18, width: '80%' }} />
        <Skeleton style={{ height: 14, width: '50%' }} />
        <Skeleton style={{ height: 14, width: '60%', marginTop: 8 }} />
      </div>
    </div>
  )
}

export function GalleryImageSkeleton() {
  return <Skeleton style={{ width: '100%', marginBottom: 16, borderRadius: 0 }} className="break-inside-avoid" />
}
```

Add to `app/globals.css`:
```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

### `app/events/loading.tsx`

```tsx
import { EventCardSkeleton } from '@/components/ui/Skeleton'

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Page header skeleton */}
      <div className="h-[50vh] bg-[#0F0F0F] flex items-end pb-16 px-8">
        <div className="max-w-7xl mx-auto w-full space-y-4">
          <div style={{ width: 120, height: 12, background: '#1A1A1A', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ width: '30%', height: 60, background: '#1A1A1A', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
```

---

### `app/releases/loading.tsx`

```tsx
import { ReleaseCardSkeleton } from '@/components/ui/Skeleton'

export default function ReleasesLoading() {
  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        <div style={{ width: 100, height: 12, background: '#1A1A1A', marginBottom: 16 }} />
        <div style={{ width: '25%', height: 56, background: '#1A1A1A', marginBottom: 48 }} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ReleaseCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
```

---

### `app/gallery/loading.tsx`

```tsx
import { Skeleton } from '@/components/ui/Skeleton'

export default function GalleryLoading() {
  const heights = [240, 320, 200, 360, 280, 240, 300, 200, 340, 260, 220, 300]
  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        <div style={{ width: 80, height: 12, background: '#1A1A1A', marginBottom: 16 }} />
        <div style={{ width: '20%', height: 56, background: '#1A1A1A', marginBottom: 48 }} />
        <div style={{ columns: 3, gap: 16 }}>
          {heights.map((h, i) => (
            <Skeleton key={i} style={{ height: h, width: '100%', marginBottom: 16, display: 'block' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## PART 2 — ERROR PAGES

---

### `app/error.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="section-label mb-6">Something went wrong</p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(48px, 8vw, 80px)',
            color: '#F5F0E8',
            lineHeight: 0.9,
            marginBottom: 24,
          }}
        >
          An error
          <br />
          <em style={{ color: '#C9A84C' }}>occurred.</em>
        </h1>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 40 }}>
          Something unexpected happened. This has been noted.
          {error.digest && (
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: '#333', marginTop: 8 }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#C9A84C] text-[#080808] px-6 py-3 font-semibold hover:bg-[#E8C96D] transition"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] transition px-6 py-3"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

### `app/not-found.tsx`

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">

        {/* Big 404 */}
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(120px, 20vw, 220px)',
            color: '#C9A84C',
            lineHeight: 1,
            opacity: 0.08,
            userSelect: 'none',
            marginBottom: -40,
          }}
        >
          404
        </p>

        <p className="section-label mb-6">Page not found</p>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            color: '#F5F0E8',
            lineHeight: 0.9,
            marginBottom: 24,
          }}
        >
          This page
          <br />
          <em style={{ color: '#C9A84C' }}>doesn&apos;t exist.</em>
        </h1>

        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 40, maxWidth: 360, margin: '0 auto 40px' }}>
          The page you&apos;re looking for may have been moved, deleted, or never existed.
          Let&apos;s get you back to the music.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#C9A84C] text-[#080808] px-6 py-3 font-semibold hover:bg-[#E8C96D] transition"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Go Home
          </Link>
          <Link
            href="/events"
            className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] transition px-6 py-3"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            View Events
          </Link>
          <Link
            href="/releases"
            className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] transition px-6 py-3"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Listen Now
          </Link>
        </div>

        {/* Gold saxophone decoration */}
        <p style={{ fontSize: 64, marginTop: 60, opacity: 0.06 }}>🎷</p>
      </div>
    </div>
  )
}
```

---

## PART 3 — FULL SEO METADATA

Add or update the `generateMetadata` export on every page listed below. The root `app/layout.tsx` already has base metadata — these are page-level overrides.

---

### `app/about/page.tsx` — add at the top (before the component):

```ts
export const metadata = {
  title: 'About — BeeJay Sax',
  description: 'Abolaji David Banjoko — gospel saxophonist, music minister, and convener of the Beejay Sax Live Concert. From engineering graduate to one of Nigeria\'s finest saxophonists.',
  openGraph: {
    title: 'About BeeJay Sax',
    description: 'From engineering to ministry — the story of Abolaji David Banjoko.',
    url: 'https://beejaysax.com/about',
  },
}
```

---

### `app/events/page.tsx` — add at the top:

```ts
export const metadata = {
  title: 'Events — BeeJay Sax',
  description: 'Upcoming concerts and gospel events featuring BeeJay Sax live. Book your tickets for the next Beejay Sax Live Concert.',
  openGraph: {
    title: 'BeeJay Sax — Live Events',
    description: 'Upcoming concerts, gospel events, and live ministry appearances.',
    url: 'https://beejaysax.com/events',
  },
}
```

---

### `app/releases/page.tsx` — add at the top:

```ts
export const metadata = {
  title: 'Releases — BeeJay Sax',
  description: 'Discography of BeeJay Sax — gospel saxophone albums, singles, and EPs. Stream on Spotify, Apple Music, Audiomack, and YouTube.',
  openGraph: {
    title: 'BeeJay Sax — Discography',
    description: 'Albums, singles, and EPs. Gospel saxophone music for every season.',
    url: 'https://beejaysax.com/releases',
  },
}
```

---

### `app/gallery/page.tsx` — add at the top:

```ts
export const metadata = {
  title: 'Gallery — BeeJay Sax',
  description: 'Photos of BeeJay Sax in performance — concerts, events, and behind the scenes moments.',
  openGraph: {
    title: 'BeeJay Sax — Gallery',
    description: 'Performance photos and ministry moments.',
    url: 'https://beejaysax.com/gallery',
  },
}
```

---

### `app/contact/page.tsx` — add at the top:

```ts
export const metadata = {
  title: 'Contact — BeeJay Sax',
  description: 'Book BeeJay Sax for concerts, gospel events, corporate functions, and collaborations. Get in touch with the team.',
  openGraph: {
    title: 'Contact BeeJay Sax',
    description: 'Available for bookings, collaborations, and media inquiries.',
    url: 'https://beejaysax.com/contact',
  },
}
```

---

### `app/events/[id]/page.tsx` — replace existing generateMetadata (or add if missing):

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return { title: 'Event Not Found — BeeJay Sax' }

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return {
    title: `${event.title} — BeeJay Sax`,
    description: `${event.title} at ${event.venue}, ${event.city} on ${formattedDate}. ${event.description?.slice(0, 100) ?? ''}`,
    openGraph: {
      title: event.title,
      description: `${event.venue} · ${event.city} · ${formattedDate}`,
      url: `https://beejaysax.com/events/${id}`,
      images: event.posterImage ? [{ url: event.posterImage, width: 1200, height: 630 }] : [],
    },
  }
}
```

---

### `app/releases/[slug]/page.tsx` — replace existing generateMetadata (or add if missing):

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const release = await prisma.release.findUnique({ where: { slug } })
  if (!release) return { title: 'Release Not Found — BeeJay Sax' }

  return {
    title: `${release.title} — BeeJay Sax`,
    description: release.description ?? `${release.title} by BeeJay Sax. Stream now on all platforms.`,
    openGraph: {
      title: release.title,
      description: release.description ?? `Gospel saxophone — ${release.releaseType.toLowerCase()} by BeeJay Sax`,
      url: `https://beejaysax.com/releases/${slug}`,
      images: release.coverImage ? [{ url: release.coverImage, width: 1200, height: 1200 }] : [],
    },
  }
}
```

---

## PART 4 — ROBOTS & SITEMAP

---

### `app/robots.ts`

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/tickets/'],
      },
    ],
    sitemap: 'https://beejaysax.com/sitemap.xml',
  }
}
```

---

### `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://beejaysax.com'

  const [events, releases] = await Promise.all([
    prisma.event.findMany({ where: { status: 'UPCOMING' }, select: { id: true, updatedAt: true } }),
    prisma.release.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/events`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/releases`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
  ]

  const eventPages: MetadataRoute.Sitemap = events.map(e => ({
    url: `${baseUrl}/events/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const releasePages: MetadataRoute.Sitemap = releases.map(r => ({
    url: `${baseUrl}/releases/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...eventPages, ...releasePages]
}
```

---

## PART 5 — BACK TO TOP BUTTON

### `components/ui/BackToTop.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 44,
        height: 44,
        background: '#C9A84C',
        color: '#080808',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        zIndex: 100,
        transition: 'background 0.2s, transform 0.2s',
        boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#E8C96D')}
      onMouseLeave={e => (e.currentTarget.style.background = '#C9A84C')}
    >
      ↑
    </button>
  )
}
```

Add `<BackToTop />` to `app/layout.tsx` inside the `<LenisProvider>` block, just before the closing tag.

---

## PART 6 — VERCEL DEPLOYMENT CONFIG

---

### `vercel.json` (repo root)

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "X-Frame-Options",           "value": "DENY" },
        { "key": "X-XSS-Protection",          "value": "1; mode=block" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",        "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/admin/scanner",
      "headers": [
        { "key": "Permissions-Policy", "value": "camera=(self)" }
      ]
    }
  ]
}
```

Note: The scanner page overrides the camera permission to allow camera access for the QR scanner.

---

### Update `package.json` — add/confirm these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

The `postinstall` hook ensures Prisma generates the client on every Vercel build.

---

### `.env.example` — replace with complete version:

```env
# ── Neon PostgreSQL ──────────────────────────────
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/beejaysax?sslmode=require&pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://username:password@ep-xxx.neon.tech/beejaysax?sslmode=require

# ── NextAuth ─────────────────────────────────────
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://beejaysax.com

# ── Cloudinary ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# ── Resend (email) ───────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=tickets@beejaysax.com
ADMIN_EMAIL=admin@beejaysax.com

# ── Ticket verification ──────────────────────────
ADMIN_VERIFY_KEY=generate-a-strong-random-key
NEXT_PUBLIC_ADMIN_VERIFY_KEY=same-value-as-ADMIN_VERIFY_KEY

# ── Site ─────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://beejaysax.com
```

---

### `README.md` — replace with final version:

```md
# BeeJay Sax — Official Website
Built by [SonsHub Media Ltd.](https://sonshubmedia.com)

## Stack
Next.js 16 · TypeScript · Tailwind CSS v4 · Prisma 5 · Neon PostgreSQL
NextAuth v5 · GSAP 3 · Lenis · Cloudinary · Resend · QR Tickets

## Local Setup

1. Clone repo
2. `npm install`
3. Copy `.env.example` → `.env.local` and fill all values
4. `npx prisma db push`
5. `npx prisma db seed`
6. `npm run dev`

Open http://localhost:3000

Admin: http://localhost:3000/admin
Login: `admin` / `BeejaySax2026!` — **change immediately after first login**

## Deployment (Vercel — Staging)

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add all env variables from `.env.example` in Vercel → Settings → Environment Variables
4. Set `NEXTAUTH_URL` to your Vercel preview URL first, then update to production domain
5. Deploy

## Migration to Webuzo VPS (Production)

When client approves the Vercel staging build:

1. SSH into Webuzo server
2. Install Node.js 20+, PM2, Nginx
3. Clone repo to `/var/www/beejaysax`
4. Copy `.env.local` with production values to server
5. `npm install && npm run build`
6. `pm2 start npm --name beejaysax -- start`
7. Configure Nginx reverse proxy to port 3000
8. Point beejaysax.com DNS to server IP
9. Enable SSL via Certbot

## Key Routes

| Route                        | Description                        |
|-----------------------------|------------------------------------|
| `/`                         | Homepage                           |
| `/events`                   | All events                         |
| `/events/[id]`              | Event detail + ticket purchase     |
| `/events/[id]/purchase`     | Ticket registration form           |
| `/tickets/[token]`          | Digital ticket with QR code        |
| `/releases`                 | Discography                        |
| `/releases/[slug]`          | Release detail                     |
| `/gallery`                  | Photo gallery                      |
| `/about`                    | Artist biography                   |
| `/contact`                  | Contact + booking form             |
| `/admin`                    | Dashboard (auth required)          |
| `/admin/events`             | Events CRUD                        |
| `/admin/releases`           | Releases CRUD                      |
| `/admin/gallery`            | Gallery manager                    |
| `/admin/messages`           | Messages inbox                     |
| `/admin/scanner`            | QR ticket scanner                  |
| `/api/tickets/purchase`     | POST — create ticket               |
| `/api/tickets/[token]/verify` | POST — verify + admit ticket     |
| `/sitemap.xml`              | Auto-generated sitemap             |
| `/robots.txt`               | Crawl rules                        |
```

---

## PART 7 — PERFORMANCE OPTIMIZATIONS

---

### Update `next.config.ts` — final version:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i3.ytimg.com' },
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
  compress: true,
}

export default nextConfig
```

---

## PART 8 — FINAL QoL TOUCHES

---

### Add to `app/globals.css` (append at bottom):

```css
/* ── Focus visible ring ─────────────────────────── */
:focus-visible {
  outline: 2px solid #C9A84C;
  outline-offset: 3px;
}

/* ── Smooth page transitions ────────────────────── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

main > * {
  animation: fadeInUp 0.4s ease both;
}

/* ── No print utility ───────────────────────────── */
@media print {
  .no-print { display: none !important; }
  nav, footer { display: none !important; }
  body { background: white; color: black; }
}

/* ── Mobile tap highlight ───────────────────────── */
* { -webkit-tap-highlight-color: rgba(201, 168, 76, 0.15); }

/* ── Smooth image rendering ─────────────────────── */
img { image-rendering: auto; }
```

---

### Fix: Add `rel="noopener noreferrer"` to all external links

Find all `target="_blank"` links across the codebase that are missing `rel="noopener noreferrer"` and add it. This applies to:
- Streaming platform links in `ReleaseCard.tsx` and `releases/[slug]/page.tsx`
- Social links in `Footer.tsx`
- WhatsApp share links
- YouTube links in `VideoSection.tsx`

---

### Fix: Ensure all `<Image>` components have `alt` text

Audit all `next/image` usages across the codebase. If any have empty `alt=""`, add descriptive alt text based on context.

---

## PART 9 — TEST CHECKLIST

After Cursor finishes, verify:

```
PUBLIC SITE
□ / (homepage) loads with hero, all sections, no console errors
□ /events — shows events, loading skeleton before hydration
□ /events/[id] — event detail, ticket sidebar shows price/free
□ /events/[id]/purchase — ticket form works end to end
□ /tickets/[token] — ticket displays with QR code, valid/used state
□ /releases — grid, filter tabs work
□ /releases/[slug] — detail page, streaming links
□ /gallery — masonry grid, lightbox opens
□ /about — full bio, timeline
□ /contact — form submits, toast appears
□ /sitemap.xml — renders XML with all URLs
□ /robots.txt — renders correctly
□ 404 page — visit /any-random-url
□ Back to top button — appears after scrolling 600px

SEO
□ Each page has unique <title> in browser tab
□ Open Graph tags present (check with og:debugger or curl)

ADMIN
□ /admin — redirects to login if not authenticated
□ /admin/login — login with admin / BeejaySax2026!
□ Dashboard stats load correctly
□ Create a test event, verify on /events
□ Create a test release, verify on /releases
□ Upload a gallery image via Cloudinary URL, verify on /gallery
□ Submit contact form, verify message appears in /admin/messages
□ Scanner page loads camera or shows manual fallback

PERFORMANCE
□ npm run build — zero errors, zero type errors
□ Lighthouse score: Performance > 85, SEO = 100, Accessibility > 90
```

---

## WHAT THIS PHASE DELIVERS

- ✅ Loading skeletons (global, events, releases, gallery)
- ✅ Global error boundary with retry button
- ✅ Elegant 404 page with navigation options
- ✅ Full SEO metadata on every page (title, description, OpenGraph)
- ✅ Dynamic metadata on event + release detail pages
- ✅ `robots.ts` — blocks admin/api/tickets from indexing
- ✅ `sitemap.ts` — auto-generated with all public pages + events + releases
- ✅ Back-to-top button (gold, fixed, appears after 600px scroll)
- ✅ `vercel.json` — security headers, camera permission fix for scanner
- ✅ `postinstall` Prisma generate for Vercel builds
- ✅ Complete `README.md` with Vercel + Webuzo migration instructions
- ✅ `next.config.ts` — AVIF/WebP image formats, console removal in prod, compression
- ✅ Print CSS, focus rings, smooth page transitions, tap highlight

---

*BeeJay Sax Website — Complete.*
*Built by SonsHub Media Ltd. — sonshubmedia.com*
*All phases done. Ready for Vercel deployment and client review.*
