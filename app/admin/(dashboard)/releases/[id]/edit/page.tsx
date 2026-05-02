import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReleaseForm from '@/components/admin/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const release = await prisma.release.findUnique({ where: { id } })
  if (!release) notFound()

  return (
    <div>
      <AdminPageHeader eyebrow="Releases" title="Edit release" subtitle={release.title} />
      <ReleaseForm mode="edit" release={JSON.parse(JSON.stringify(release))} />
    </div>
  )
}
