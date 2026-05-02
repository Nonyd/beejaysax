import type { Metadata } from 'next'
import SectionLabel from '@/components/ui/SectionLabel'
import { h1TextStyle } from '@/lib/typography-styles'
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
        className="relative flex min-h-[360px] h-[45vh] flex-col justify-end overflow-hidden"
        style={{
          background: [
            'linear-gradient(135deg, #080808 0%, #0F0F0F 50%, #080808 100%)',
            'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(201,168,76,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-32 md:px-12">
          <SectionLabel>Gallery</SectionLabel>
          <h1 className="mt-3 text-bjs-white" style={h1TextStyle}>
            Moments.
          </h1>
        </div>
      </section>

      <GalleryView images={images} />
    </>
  )
}
