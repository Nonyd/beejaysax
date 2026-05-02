'use client'

import Image from 'next/image'
import type { GalleryImage } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'

export default function GalleryStrip({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null

  const row = (reverse: boolean) => (
    <div
      className={`group flex w-max gap-3 ${reverse ? 'animate-marquee [animation-direction:reverse]' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
    >
      {[0, 1, 2].flatMap((dup) =>
        images.map((img) => (
          <div
            key={`${dup}-${img.id}`}
            className="relative h-[200px] w-[280px] shrink-0 overflow-hidden transition duration-300 hover:scale-105 hover:brightness-110"
          >
            <Image
              src={img.imagePath}
              alt={img.caption ?? 'BeeJay Sax — gallery photo'}
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        ))
      )}
    </div>
  )

  return (
    <section className="overflow-hidden bg-bjs-black py-16">
      <div className="mx-auto max-w-7xl px-8 text-center">
        <SectionLabel className="inline-block">Moments</SectionLabel>
      </div>

      <div className="group mt-10 space-y-6">
        <div className="overflow-hidden">{row(false)}</div>
        <div className="overflow-hidden">{row(true)}</div>
      </div>

      <div className="mt-10 flex justify-center px-8">
        <OutlineButton href="/gallery">View Full Gallery</OutlineButton>
      </div>
    </section>
  )
}
