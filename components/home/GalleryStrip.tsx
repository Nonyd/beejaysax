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

export default async function GalleryStrip() {
  const dbImages = await safeDb(
    () => prisma.galleryImage.findMany({ take: 16, orderBy: { sortOrder: 'asc' } }),
    []
  )
  const images = dbImages.length >= 4 ? dbImages.map((i) => i.imagePath) : DEMO_IMAGES
  const doubled = [...images, ...images, ...images, ...images]

  return (
    <section style={{ background: '#080808', paddingTop: 80, paddingBottom: 80, overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          Moments
        </p>
      </div>

      <div style={{ overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, animation: 'marquee 40s linear infinite', width: 'max-content' }}>
          {doubled.map((src, i) => (
            <div
              key={`a-${i}`}
              style={{ flexShrink: 0, width: 280, height: 180, position: 'relative', overflow: 'hidden' }}
            >
              <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="280px" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            animation: 'marquee 50s linear infinite reverse',
            width: 'max-content',
          }}
        >
          {[...doubled].reverse().map((src, i) => (
            <div
              key={`b-${i}`}
              style={{ flexShrink: 0, width: 280, height: 180, position: 'relative', overflow: 'hidden' }}
            >
              <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="280px" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link
          href="/gallery"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            textDecoration: 'none',
            border: '1px solid rgba(201,168,76,0.3)',
            padding: '12px 28px',
            display: 'inline-block',
          }}
        >
          View Full Gallery →
        </Link>
      </div>
    </section>
  )
}
