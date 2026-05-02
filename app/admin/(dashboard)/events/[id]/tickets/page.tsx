import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TicketListClient from '@/components/admin/TicketListClient'
import SectionLabel from '@/components/ui/SectionLabel'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

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
      <nav
        className="mb-8 flex flex-wrap items-center gap-2"
        style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}
      >
        <Link href="/admin/events" style={{ color: '#777', textDecoration: 'none' }}>
          Events
        </Link>
        <span style={{ color: '#333' }}>/</span>
        <span style={{ color: '#C9A84C' }}>{event.title}</span>
      </nav>

      <AdminPageHeader
        eyebrow="Tickets"
        title="Registrations & scanner"
        subtitle="View attendees, revenue, and verify QR codes at the door."
      />

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Registered', value: tickets.length },
          { label: 'Admitted', value: usedCount },
          { label: 'Remaining', value: tickets.length - usedCount },
          { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-[#1E1E1E] bg-[#0F0F0F] p-5"
            style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
          >
            <SectionLabel className="mb-2">{stat.label}</SectionLabel>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: '#C9A84C', lineHeight: 1, fontWeight: 700 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <TicketListClient tickets={JSON.parse(JSON.stringify(tickets))} eventId={id} />
    </div>
  )
}
