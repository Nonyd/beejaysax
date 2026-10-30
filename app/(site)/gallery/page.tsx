import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import GalleryView from '@/components/gallery/GalleryView'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'

export const metadata: Metadata = pageMetadata({
  title: 'Gallery — BeeJay Sax',
  description: 'Photos of BeeJay Sax in performance: concerts, events and behind-the-scenes moments.',
  path: '/gallery',
  shareTitle: 'BeeJay Sax — Gallery',
  shareDescription: 'Performance photos and ministry moments.',
})

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const h = await getContent('pageHeaders')
  const images = await safeDb(() => prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } }), [])

  return (
    <>
      <PageHero title={[h.galleryTitle]} intro={h.galleryIntro} />
      <GalleryView images={images} />
    </>
  )
}
