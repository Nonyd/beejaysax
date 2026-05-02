import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TicketListClient from '@/components/admin/TicketListClient'

export const dynamic = 'force-dynamic'

export default async function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const tickets = await prisma.ticket.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
  })

  const usedCount = tickets.filter((t) => t.isUsed).length
  const totalRevenue = tickets.reduce((sum, t) => sum + (t.totalAmount ?? 0), 0)

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/events" style={{ color: '#555', fontSize: 13 }}>
          ← Events
        </Link>
        <span style={{ color: '#2A2A2A' }}>/</span>
        <span style={{ color: '#F5F0E8', fontSize: 13 }}>{event.title}</span>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 24 }}>
        Tickets & Scanner
      </h2>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Registered', value: tickets.length },
          { label: 'Admitted', value: usedCount },
          { label: 'Remaining', value: tickets.length - usedCount },
          { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="border border-[#1E1E1E] bg-[#0F0F0F] p-4">
            <p className="section-label mb-2">{stat.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: '#C9A84C', lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <TicketListClient tickets={JSON.parse(JSON.stringify(tickets))} eventId={id} />
    </div>
  )
}
