import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import RegistrationsClient, { type RegRow } from '@/components/admin/events/RegistrationsClient'
import { currencySymbol } from '@/lib/events/editor-data'
import { expireStaleOrders, HOLD_MINUTES } from '@/lib/events/orders'

export const dynamic = 'force-dynamic'

export default async function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('events')
  const { id } = await params
  await expireStaleOrders()
  const event = await prisma.event.findUnique({
    where: { id },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!event) notFound()

  const [tickets, orders] = await Promise.all([
    prisma.ticket.findMany({
      where: { eventId: id },
      include: { order: { select: { reference: true, status: true, source: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({ where: { eventId: id }, select: { status: true, total: true, tierId: true, quantity: true } }),
  ])

  const sym = currencySymbol(event.currency)
  const live = tickets.filter((t) => !t.cancelledAt && t.paymentStatus !== 'REFUNDED')
  const paidOrders = orders.filter((o) => o.status === 'PAID')
  const legacyRevenue = tickets.filter((t) => !t.orderId && t.paymentStatus === 'PAID').reduce((s, t) => s + t.totalAmount, 0)
  const revenue = paidOrders.reduce((s, o) => s + o.total, 0) + legacyRevenue
  const pending = orders.filter((o) => o.status === 'PENDING')

  const tierStats = event.tiers.map((t) => {
    const sold = live.filter((x) => x.tierId === t.id).length
    return {
      id: t.id,
      name: t.name,
      sold,
      capacity: t.capacity,
      revenue: paidOrders.filter((o) => o.tierId === t.id).reduce((s, o) => s + o.total, 0),
      isVisible: t.isVisible,
    }
  })

  const rows: RegRow[] = tickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    name: `${t.firstName} ${t.lastName}`,
    email: t.email,
    phone: t.phone,
    tier: t.tierName ?? t.ticketType,
    tierId: t.tierId,
    amount: t.totalAmount,
    reference: t.order?.reference ?? t.paymentRef,
    source: t.order?.source ?? 'PUBLIC',
    isUsed: t.isUsed,
    usedAt: t.usedAt?.toISOString() ?? null,
    usedBy: t.usedByAdmin,
    cancelled: Boolean(t.cancelledAt) || t.paymentStatus === 'REFUNDED',
    qrToken: t.qrToken,
    createdAt: t.createdAt.toISOString(),
    emailStatus: t.emailStatus,
    emailError: t.emailError,
  }))

  const stat = (label: string, value: string | number, hint?: string) => (
    <div className="rounded-[18px] border border-ivory/12 bg-ink p-5">
      <p className="text-[13px] font-semibold text-gold">{label}</p>
      <p className="mt-2 font-display text-[34px] leading-none text-ivory">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-ivory/55">{hint}</p>}
    </div>
  )

  return (
    <div>
      <nav className="mb-8 text-[13px]">
        <Link href="/admin/events" className="text-ivory/65 no-underline">Events</Link>
        <span className="mx-2 text-ivory/35">/</span>
        <span className="text-gold">{event.title}</span>
      </nav>
      <AdminPageHeader
        eyebrow="Registrations"
        title={event.title}
        subtitle="Everyone holding a ticket, sales by ticket type, and door check-in."
        action={
          <>
            <Link href={`/admin/events/${id}/checkin`} className="bg-gold px-6 py-3 font-semibold text-night no-underline">
              Open door scanner
            </Link>
            <Link href={`/admin/events/${id}/edit`} className="border border-ivory/25 px-6 py-3 font-semibold text-ivory no-underline">
              Edit event
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat('Tickets issued', live.length, event.totalTickets ? `of ${event.totalTickets} capacity` : undefined)}
        {stat('Checked in', live.filter((t) => t.isUsed).length, live.length ? `${Math.round((live.filter((t) => t.isUsed).length / live.length) * 100)}% of tickets` : undefined)}
        {stat('Revenue', `${sym}${revenue.toLocaleString()}`, `${paidOrders.length} paid orders`)}
        {stat('Awaiting payment', pending.length, pending.length ? `Seats are held for ${HOLD_MINUTES} minutes` : 'No open checkouts')}
      </div>

      {tierStats.length > 0 && (
        <div className="mb-10 rounded-[20px] border border-ivory/12 bg-ink p-6">
          <p className="mb-4 font-display text-xl text-ivory">Sales by ticket type</p>
          <ul className="space-y-4">
            {tierStats.map((t) => {
              const pct = t.capacity ? Math.min(100, Math.round((t.sold / t.capacity) * 100)) : null
              return (
                <li key={t.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[14px]">
                    <span className="font-semibold text-ivory">
                      {t.name}
                      {!t.isVisible && <span className="ml-2 text-[12px] font-normal text-warn">hidden</span>}
                    </span>
                    <span className="text-ivory/70">
                      {t.sold}
                      {t.capacity ? ` / ${t.capacity}` : ''} sold · {sym}
                      {t.revenue.toLocaleString()}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-night">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-danger' : pct >= 60 ? 'bg-warn' : 'bg-gold'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <RegistrationsClient
        eventId={id}
        rows={rows}
        tiers={event.tiers.map((t) => ({ id: t.id, name: t.name }))}
        currencySymbol={sym}
        siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')}
      />
    </div>
  )
}
