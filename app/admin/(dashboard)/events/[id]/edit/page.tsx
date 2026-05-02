import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>
        Edit Event
      </h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>{event.title}</p>
      <EventForm mode="edit" event={JSON.parse(JSON.stringify(event))} />
    </div>
  )
}
