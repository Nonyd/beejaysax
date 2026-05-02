'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { GalleryImage } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'

export default function GalleryStrip({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null

  const row = (reverse: boolean) => (
    <div
      className={`flex w-max gap-3 ${reverse ? 'animate-marquee-fast [animation-direction:reverse]' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
    >
      {[0, 1, 2].flatMap((dup) =>
        images.map((img) => (
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
