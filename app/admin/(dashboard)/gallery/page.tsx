import { prisma } from '@/lib/prisma'
import GalleryManager from '@/components/admin/GalleryManager'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Media"
        title="Gallery"
        subtitle="Upload and organise images for the public gallery — drag to reorder when supported."
      />
      <GalleryManager initialImages={JSON.parse(JSON.stringify(images))} />
    </div>
  )
}
