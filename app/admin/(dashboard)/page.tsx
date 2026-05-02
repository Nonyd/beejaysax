import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    upcomingEvents,
    totalTickets,
    usedTickets,
    revenueData,
    releaseCount,
    galleryCount,
    unreadMessages,
    recentTickets,
    recentMessages,
  ] = await Promise.all([
    prisma.event.count({ where: { status: 'UPCOMING' } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { isUsed: true } }),
    prisma.ticket.aggregate({ _sum: { totalAmount: true } }),
    prisma.release.count(),
    prisma.galleryImage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { event: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const totalRevenue = revenueData._sum.totalAmount ?? 0

  const stats = [
    { label: 'Upcoming Events', value: upcomingEvents, sub: 'concerts scheduled' },
    { label: 'Tickets Sold', value: totalTickets, sub: `${usedTickets} used at door` },
    {
      label: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      sub: 'from ticket sales',
      isText: true,
    },
    { label: 'Unread Messages', value: unreadMessages, sub: 'awaiting reply' },
    { label: 'Releases', value: releaseCount, sub: 'in discography' },
    { label: 'Gallery Images', value: galleryCount, sub: 'uploaded' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#F5F0E8' }}>Welcome back.</h2>
        <p style={{ color: '#555', fontSize: 14, marginTop: 4 }}>Here&apos;s what&apos;s happening with BeeJay Sax.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-[#1E1E1E] bg-[#0F0F0F] p-6">
            <p className="section-label mb-3">{stat.label}</p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: stat.isText ? 28 : 48,
                color: '#C9A84C',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p style={{ color: '#444', fontSize: 12, marginTop: 8 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        {[
          { label: '+ New Event', href: '/admin/events/new', gold: true },
          { label: '+ New Release', href: '/admin/releases/new', gold: false },
          { label: 'Upload Photos', href: '/admin/gallery', gold: false },
          { label: 'View Messages', href: '/admin/messages', gold: false },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="transition"
            style={{
              padding: '10px 20px',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              background: action.gold ? '#C9A84C' : 'transparent',
              color: action.gold ? '#080808' : '#F5F0E8',
              border: action.gold ? 'none' : '1px solid #2A2A2A',
            }}
          >
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-[#1E1E1E] bg-[#0F0F0F]">
          <div className="border-b border-[#1E1E1E] px-6 py-4">
            <p className="section-label">Recent Registrations</p>
          </div>
          <div className="divide-y divide-[#1E1E1E]">
            {recentTickets.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-[#444]">No tickets yet</p>
            )}
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p style={{ fontSize: 14, color: '#F5F0E8' }}>
                    {ticket.firstName} {ticket.lastName}
                  </p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{ticket.event.title}</p>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    background: ticket.isUsed ? 'rgba(127,29,29,0.3)' : 'rgba(20,83,45,0.3)',
                    color: ticket.isUsed ? '#f87171' : '#4ade80',
                    border: `1px solid ${ticket.isUsed ? 'rgba(127,29,29,0.5)' : 'rgba(20,83,45,0.5)'}`,
                  }}
                >
                  {ticket.isUsed ? 'Used' : 'Valid'}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1E1E1E] px-6 py-3">
            <Link href="/admin/events" style={{ fontSize: 12, color: '#C9A84C' }}>
              View all →
            </Link>
          </div>
        </div>

        <div className="border border-[#1E1E1E] bg-[#0F0F0F]">
          <div className="border-b border-[#1E1E1E] px-6 py-4">
            <p className="section-label">Recent Messages</p>
          </div>
          <div className="divide-y divide-[#1E1E1E]">
            {recentMessages.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-[#444]">No messages yet</p>
            )}
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-6 py-4"
                style={{ borderLeft: msg.isRead ? 'none' : '2px solid #C9A84C' }}
              >
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: msg.isRead ? 400 : 600 }}>{msg.name}</p>
                  <span style={{ fontSize: 10, color: '#555' }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#555', marginTop: 2 }} className="truncate">
                  {msg.subject}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1E1E1E] px-6 py-3">
            <Link href="/admin/messages" style={{ fontSize: 12, color: '#C9A84C' }}>
              View all →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
