import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
]

const TILE_W = 320
const TILE_H = 200

export default async function GalleryStrip() {
  const dbImages = await safeDb(
    () => prisma.galleryImage.findMany({ take: 16, orderBy: { sortOrder: 'asc' } }),
    []
  )
  const images = dbImages.length >= 4 ? dbImages.map((i) => i.imagePath) : DEMO_IMAGES
  const doubled = [...images, ...images, ...images, ...images]

  return (
    <section style={{ background: '#080808', paddingTop: 96, paddingBottom: 96, overflow: 'hidden' }}>
      <div className="site-shell" style={{ marginBottom: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 8,
          }}
        >
          Moments
        </p>
        <div style={{ height: 1, maxWidth: 80, background: '#C9A84C', margin: '0 auto', opacity: 0.45 }} />
      </div>

      <div style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, animation: 'marquee 45s linear infinite', width: 'max-content' }}>
          {doubled.map((src, i) => (
            <div
              key={`a-${i}`}
              style={{
                flexShrink: 0,
                width: TILE_W,
                height: TILE_H,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #2A2A2A',
                boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.08)',
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                style={{ objectFit: 'cover', filter: 'brightness(1.08) contrast(1.05)' }}
                sizes={`${TILE_W}px`}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            animation: 'marquee 55s linear infinite reverse',
            width: 'max-content',
          }}
        >
          {[...doubled].reverse().map((src, i) => (
            <div
              key={`b-${i}`}
              style={{
                flexShrink: 0,
                width: TILE_W,
                height: TILE_H,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #2A2A2A',
                boxShadow: 'inset 0 0 0 1px rgba(201,168,76,0.08)',
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                style={{ objectFit: 'cover', filter: 'brightness(1.08) contrast(1.05)' }}
                sizes={`${TILE_W}px`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="site-shell" style={{ textAlign: 'center', marginTop: 44 }}>
        <Link
          href="/gallery"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            textDecoration: 'none',
            border: '1px solid rgba(201,168,76,0.35)',
            padding: '14px 32px',
            display: 'inline-block',
          }}
        >
          View Full Gallery →
        </Link>
      </div>
    </section>
  )
}
