import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  return (
    <div>
      <AdminPageHeader eyebrow="Events" title="Edit event" subtitle={event.title} />
      <EventForm mode="edit" event={JSON.parse(JSON.stringify(event))} />
    </div>
  )
}
