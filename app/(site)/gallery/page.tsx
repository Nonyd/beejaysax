import type { Metadata } from 'next'
import SectionLabel from '@/components/ui/SectionLabel'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import Image from 'next/image'

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
      <section className="px-8 pb-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Gallery</SectionLabel>
          <h1 className="mt-6 font-serif text-[clamp(52px,9vw,120px)] font-bold text-bjs-white">Moments.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-24">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {images.map((img) => (
            <div key={img.id} className="mb-4 break-inside-avoid">
              <div className="relative overflow-hidden">
                <Image
                  src={img.imagePath}
                  alt={img.caption ?? 'BeeJay Sax — gallery photo'}
                  width={800}
                  height={1000}
                  className="h-auto w-full object-cover"
                  sizes="25vw"
                />
              </div>
              {img.caption && <p className="mt-2 font-sans text-xs text-bjs-muted">{img.caption}</p>}
            </div>
          ))}
        </div>
        {images.length === 0 && <p className="font-sans text-bjs-muted">Gallery images will appear once uploaded.</p>}
      </section>
    </>
  )
}
