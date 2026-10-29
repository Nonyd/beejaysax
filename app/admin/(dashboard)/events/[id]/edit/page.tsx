import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EventEditor from '@/components/admin/events/EventEditor'
import CouponsPanel from '@/components/admin/events/CouponsPanel'
import { currencySymbol, toCouponRows, toEditorEvent } from '@/lib/events/editor-data'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('events')
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' }, include: { _count: { select: { tickets: true } } } },
      coupons: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!event) notFound()

  return (
    <div>
      <nav className="mb-8 text-[13px]">
        <Link href="/admin/events" className="text-[rgba(247,241,227,0.65)] no-underline">Events</Link>
        <span className="mx-2 text-[rgba(247,241,227,0.35)]">/</span>
        <span className="text-[#E3B23C]">{event.title}</span>
      </nav>
      <AdminPageHeader
        eyebrow={event.status === 'DRAFT' ? 'Draft' : 'Events'}
        title="Edit event"
        action={
          event.status !== 'DRAFT' ? (
            <Link href={`/events/${event.id}`} target="_blank" className="text-[14px] text-[#E3B23C] underline">
              View on site
            </Link>
          ) : undefined
        }
      />
      <EventEditor
        initial={toEditorEvent(event)}
        footer={<CouponsPanel eventId={event.id} initial={toCouponRows(event.coupons)} currencySymbol={currencySymbol(event.currency)} />}
      />
    </div>
  )
}
