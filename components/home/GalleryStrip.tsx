import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'

/** Alternating arch and rounded frames, drifting slowly like a procession. */
export default async function GalleryStrip() {
  const dbImages = await safeDb(
    () => prisma.galleryImage.findMany({ take: 16, orderBy: { sortOrder: 'asc' } }),
    []
  )
  const c = await getContent('homeSections')
  const images = dbImages.length >= 4 ? dbImages.map((i) => i.imagePath) : c.momentsFallback.map((m) => m.url).filter(Boolean)
  const doubled = [...images, ...images]

  return (
    <section className="overflow-hidden bg-ink py-24 md:py-32">
      <div className="site-shell mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
          {c.momentsTitle}
        </h2>
        <Link
          href="/gallery"
          className="self-start font-body text-base font-semibold text-gold underline decoration-gold/40 underline-offset-[6px] transition-colors hover:decoration-gold md:self-auto"
        >
          {c.momentsLink}
        </Link>
      </div>

      <div className="flex w-max animate-[marquee_70s_linear_infinite] items-end gap-5 hover:[animation-play-state:paused]">
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`relative shrink-0 overflow-hidden ${
              i % 2 === 0 ? 'arch h-[300px] w-[220px] md:h-[380px] md:w-[280px]' : 'h-[240px] w-[260px] rounded-[28px] md:h-[300px] md:w-[340px]'
            }`}
          >
            <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="340px" />
          </div>
        ))}
      </div>
    </section>
  )
}
