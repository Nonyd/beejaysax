import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReleaseForm from '@/components/admin/ReleaseForm'

export const dynamic = 'force-dynamic'

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const release = await prisma.release.findUnique({ where: { id } })
  if (!release) notFound()

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>
        Edit Release
      </h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>{release.title}</p>
      <ReleaseForm mode="edit" release={JSON.parse(JSON.stringify(release))} />
    </div>
  )
}
