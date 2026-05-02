import { prisma } from '@/lib/prisma'
import GalleryManager from '@/components/admin/GalleryManager'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Gallery</h2>
        <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage photos and media</p>
      </div>
      <GalleryManager initialImages={JSON.parse(JSON.stringify(images))} />
    </div>
  )
}
