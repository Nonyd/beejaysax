import type { Metadata } from 'next'
import GalleryView from '@/components/gallery/GalleryView'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

export const metadata: Metadata = {
  title: { absolute: 'Gallery — BeeJay Sax' },
  description: 'Photos of BeeJay Sax in performance — concerts, events, and behind the scenes moments.',
  openGraph: {
    title: 'BeeJay Sax — Gallery',
    description: 'Performance photos and ministry moments.',
    url: 'https://beejaysax.com/gallery',
  },
}

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const images = await safeDb(() => prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } }), [])

  return (
    <>
      <section
        style={{
          height: 320,
          position: 'relative',
          overflow: 'hidden',
          background: '#0F0F0F',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div className="site-shell">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 12,
              }}
            >
              Gallery
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(48px,8vw,96px)',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              <span style={{ display: 'block' }}>Moments.</span>
            </h1>
          </div>
        </div>
      </section>

      <GalleryView images={images} />
    </>
  )
}
