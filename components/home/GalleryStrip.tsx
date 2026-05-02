'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { GalleryImage } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'

/** Demo strip when DB has no gallery rows — 8 images × 3 duplicates for seamless marquee */
const DEMO_STRIP_IMAGES = [
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
] as const

type StripItem = Pick<GalleryImage, 'id' | 'imagePath'> & { caption?: string | null }

function MarqueeRow({
  items,
  reverse,
}: {
  items: { id: string; imagePath: string; caption: string | null | undefined }[]
  reverse: boolean
}) {
  const innerStyle: CSSProperties = {
    display: 'flex',
    whiteSpace: 'nowrap',
    width: 'max-content',
    gap: 12,
    animation: 'marquee 50s linear infinite',
    ...(reverse ? { animationDirection: 'reverse' } : {}),
  }

  const segment = (dup: number) => (
    <>
      {items.map((img) => (
        <Link
          key={`${dup}-${img.id}`}
          href="/gallery"
          className="relative shrink-0 overflow-hidden transition-all duration-300 ease-out hover:brightness-110"
          style={{ flexShrink: 0, width: 280, height: 180 }}
        >
          <Image
            src={img.imagePath}
            alt={img.caption ?? 'BeeJay Sax — gallery photo'}
            fill
            className="object-cover"
            sizes="280px"
          />
        </Link>
      ))}
    </>
  )

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={innerStyle}>
        {segment(0)}
        {segment(1)}
        {segment(2)}
      </div>
    </div>
  )
}

export default function GalleryStrip({ images }: { images: GalleryImage[] }) {
  const stripItems: StripItem[] =
    images.length > 0
      ? images.map((img) => ({ id: img.id, imagePath: img.imagePath, caption: img.caption }))
      : DEMO_STRIP_IMAGES.map((url, i) => ({
          id: `demo-strip-${i}`,
          imagePath: url,
          caption: null,
        }))

  const rowItems = stripItems.map((img) => ({
    id: img.id,
    imagePath: img.imagePath,
    caption: img.caption,
  }))

  return (
    <section className="overflow-hidden bg-bjs-black py-20">
      <div className="mx-auto max-w-6xl px-6 text-center md:px-8 lg:px-12">
        <SectionLabel className="inline-block">Moments</SectionLabel>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <MarqueeRow items={rowItems} reverse={false} />
        <MarqueeRow items={rowItems} reverse />
      </div>

      <div className="mt-10 flex justify-center px-6 md:px-8">
        <OutlineButton href="/gallery">View Full Gallery</OutlineButton>
      </div>
    </section>
  )
}
