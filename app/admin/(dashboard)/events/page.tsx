import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import Image from 'next/image'
import { fmt } from '@/lib/time'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EventRowActions from '@/components/admin/events/EventRowActions'
import { currencySymbol } from '@/lib/events/editor-data'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Draft', cls: 'border-ivory/30 text-ivory/75' },
  UPCOMING: { label: 'On sale', cls: 'border-success/40 text-success' },
  PAST: { label: 'Past', cls: 'border-ivory/20 text-ivory/50' },
  CANCELLED: { label: 'Cancelled', cls: 'border-danger/40 text-danger' },
}

export default async function AdminEventsPage() {
  await requireAdmin('events')
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: {
      tickets: { where: { cancelledAt: null, paymentStatus: { not: 'REFUNDED' } }, select: { isUsed: true } },
      orders: { where: { status: 'PAID' }, select: { total: true } },
    },
  })
  const now = new Date()
  const upcoming = events.filter((e) => e.status === 'UPCOMING' && e.eventDate >= now)
  const sold = events.reduce((s, e) => s + e.tickets.length, 0)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Events"
        title="Concerts & appearances"
        subtitle="Create events, sell tickets, and track attendance from one place."
        action={
          <Link href="/admin/events/new" className="bg-gold px-6 py-3 font-semibold text-night no-underline">
            + New event
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          ['Upcoming events', upcoming.length],
          ['Drafts', events.filter((e) => e.status === 'DRAFT').length],
          ['Tickets issued (all events)', sold],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-ivory/12 bg-ink p-5">
            <p className="text-[13px] font-semibold text-gold">{label}</p>
            <p className="mt-2 font-display text-[34px] leading-none text-ivory">{value}</p>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-ivory/20 p-16 text-center">
          <p className="font-display text-2xl text-ivory">No events yet</p>
          <p className="mt-2 text-ivory/60">Create one, add ticket types, and publish it when you’re ready.</p>
          <Link href="/admin/events/new" className="mt-6 inline-block bg-gold px-6 py-3 font-semibold text-night no-underline">
            Create an event
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const s = STATUS[e.status] ?? STATUS.DRAFT
            const revenue = e.orders.reduce((sum, o) => sum + o.total, 0)
            const checkedIn = e.tickets.filter((t) => t.isUsed).length
            const ended = e.eventDate < now && e.status === 'UPCOMING'
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-5 rounded-[18px] border border-ivory/12 bg-ink p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-night">
                  {e.posterImage ? (
                    <Image src={e.posterImage} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-2xl text-gold">{fmt(e.eventDate, 'd')}</span>
                  )}
                </div>
                <div className="min-w-[220px] flex-1">
                  <Link href={`/admin/events/${e.id}/edit`} className="font-display text-xl text-ivory no-underline hover:text-gold">
                    {e.title}
                  </Link>
                  <p className="text-[14px] text-ivory/65">
                    {fmt(e.eventDate, 'EEE d MMM yyyy, h:mm a')} · {e.venue}, {e.city}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-[14px]">
                  <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${s.cls}`}>{ended ? 'Ended' : s.label}</span>
                  <span className="text-ivory/75">
                    <strong className="text-ivory">{e.tickets.length}</strong>
                    {e.totalTickets ? ` / ${e.totalTickets}` : ''} tickets
                  </span>
                  <span className="text-ivory/75">
                    <strong className="text-ivory">{checkedIn}</strong> in
                  </span>
                  <span className="text-ivory/75">
                    <strong className="text-ivory">
                      {currencySymbol(e.currency)}
                      {revenue.toLocaleString()}
                    </strong>
                  </span>
                </div>
                <EventRowActions id={e.id} status={e.status} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
