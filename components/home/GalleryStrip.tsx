'use client'

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

export default function GalleryStrip({ images }: { images: GalleryImage[] }) {
  const stripItems: StripItem[] =
    images.length > 0
      ? images.map((img) => ({ id: img.id, imagePath: img.imagePath, caption: img.caption }))
      : DEMO_STRIP_IMAGES.map((url, i) => ({
          id: `demo-strip-${i}`,
          imagePath: url,
          caption: null,
        }))

  const row = (reverse: boolean) => (
    <div
      className={`flex w-max gap-3 ${reverse ? 'animate-marquee-fast [animation-direction:reverse]' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
    >
      {[0, 1, 2].flatMap((dup) =>
        stripItems.map((img) => (
          <Link
            key={`${dup}-${img.id}`}
            href="/gallery"
            className="relative h-[180px] w-[260px] shrink-0 overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:brightness-110"
          >
            <Image
              src={img.imagePath}
              alt={img.caption ?? 'BeeJay Sax — gallery photo'}
              fill
              className="object-cover"
              sizes="260px"
            />
          </Link>
        ))
      )}
    </div>
  )

  return (
    <section className="overflow-hidden bg-bjs-black py-20">
      <div className="mx-auto max-w-6xl px-6 text-center md:px-8 lg:px-12">
        <SectionLabel className="inline-block">Moments</SectionLabel>
      </div>

      <div className="group mt-8 space-y-3">
        <div className="overflow-hidden">{row(false)}</div>
        <div className="overflow-hidden">{row(true)}</div>
      </div>

      <div className="mt-10 flex justify-center px-6 md:px-8">
        <OutlineButton href="/gallery">View Full Gallery</OutlineButton>
      </div>
    </section>
  )
}
