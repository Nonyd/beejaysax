import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import AdminPageHeader, { adminOutlineLinkStyle, adminPrimaryLinkStyle } from '@/components/admin/AdminPageHeader'
import { requireAdmin } from '@/lib/admin-auth'
import { ADMIN_NAV, can } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin()
  const { denied } = await searchParams
  const show = {
    events: can(admin, 'events'),
    releases: can(admin, 'releases'),
    gallery: can(admin, 'gallery'),
    messages: can(admin, 'messages'),
  }
  // Each section's figures are only queried for admins who can open that section.
  const when = <T,>(allowed: boolean, query: () => Promise<T>, fallback: T) => (allowed ? query() : Promise.resolve(fallback))

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
    when(show.events, () => prisma.event.count({ where: { status: 'UPCOMING' } }), 0),
    when(show.events, () => prisma.ticket.count(), 0),
    when(show.events, () => prisma.ticket.count({ where: { isUsed: true } }), 0),
    when(show.events, () => prisma.ticket.aggregate({ _sum: { totalAmount: true } }), { _sum: { totalAmount: 0 } }),
    when(show.releases, () => prisma.release.count(), 0),
    when(show.gallery, () => prisma.galleryImage.count(), 0),
    when(show.messages, () => prisma.contactMessage.count({ where: { isRead: false } }), 0),
    when(show.events, () => prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { event: true } }), []),
    when(show.messages, () => prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }), []),
  ])

  const totalRevenue = revenueData._sum.totalAmount ?? 0

  const stats = [
    { label: 'Upcoming Events', value: upcomingEvents, sub: 'concerts scheduled', allowed: show.events },
    { label: 'Tickets Sold', value: totalTickets, sub: `${usedTickets} used at door`, allowed: show.events },
    {
      label: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      sub: 'from ticket sales',
      isText: true,
      allowed: show.events,
    },
    { label: 'Unread Messages', value: unreadMessages, sub: 'awaiting reply', allowed: show.messages },
    { label: 'Releases', value: releaseCount, sub: 'in discography', allowed: show.releases },
    { label: 'Gallery Images', value: galleryCount, sub: 'uploaded', allowed: show.gallery },
  ].filter((s) => s.allowed)

  const quickLinks = ADMIN_NAV.filter((item) => item.href !== '/admin' && item.permission && can(admin, item.permission))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Dashboard"
        title={`Welcome back${admin.name ? `, ${admin.name.split(' ')[0]}` : ''}`}
        subtitle={
          stats.length
            ? `Here's what's happening with BeeJay Sax — tickets, releases, and fan messages at a glance.`
            : 'Pick a section from the menu to get started.'
        }
      />

      {denied && (
        <p className="mb-8 rounded-[14px] border border-[#f0a35e]/40 px-4 py-3 text-[14px] text-[#f0a35e]">
          Your account does not have access to that page. Ask a super admin if you need it.
        </p>
      )}

      {stats.length === 0 && (
        <div className="mb-10 flex flex-wrap gap-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} style={adminOutlineLinkStyle()}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              border: '1px solid rgba(247,241,227,0.12)',
              background: '#1B1F4B',
              padding: '24px 28px',
              transition: 'border-color 200ms, box-shadow 200ms',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
            className="hover:border-[rgba(247,241,227,0.2)]"
          >
            <SectionLabel className="mb-3">{stat.label}</SectionLabel>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: stat.isText ? 30 : 44,
                color: '#E3B23C',
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              {stat.value}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(247,241,227,0.6)', fontSize: 13, marginTop: 10 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {stats.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-3">
          {show.events && (
            <Link href="/admin/events/new" style={adminPrimaryLinkStyle()}>
              + New Event
            </Link>
          )}
          {show.releases && (
            <Link href="/admin/releases/new" style={adminOutlineLinkStyle()}>
              + New Release
            </Link>
          )}
          {show.gallery && (
            <Link href="/admin/gallery" style={adminOutlineLinkStyle()}>
              Upload Photos
            </Link>
          )}
          {show.messages && (
            <Link href="/admin/messages" style={adminOutlineLinkStyle()}>
              View Messages
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {show.events && (
        <div style={{ border: '1px solid rgba(247,241,227,0.12)', background: '#1B1F4B', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid rgba(247,241,227,0.12)', padding: '20px 24px' }}>
            <SectionLabel>Recent Registrations</SectionLabel>
          </div>
          <div className="divide-y divide-[rgba(247,241,227,0.12)]">
            {recentTickets.length === 0 && (
              <p className="px-6 py-10 text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,241,227,0.55)' }}>
                No tickets yet
              </p>
            )}
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: '#F7F1E3' }}>
                    {ticket.firstName} {ticket.lastName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,241,227,0.6)', marginTop: 4 }}>
                    {ticket.event.title}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '6px 10px',
                    background: ticket.isUsed ? 'rgba(127,29,29,0.25)' : 'rgba(20,83,45,0.25)',
                    color: ticket.isUsed ? '#f87171' : '#4ade80',
                    border: `1px solid ${ticket.isUsed ? 'rgba(127,29,29,0.45)' : 'rgba(20,83,45,0.45)'}`,
                  }}
                >
                  {ticket.isUsed ? 'Used' : 'Valid'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(247,241,227,0.12)', padding: '14px 24px' }}>
            <Link href="/admin/events" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#E3B23C' }}>
              View all →
            </Link>
          </div>
        </div>
        )}

        {show.messages && (
        <div style={{ border: '1px solid rgba(247,241,227,0.12)', background: '#1B1F4B', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid rgba(247,241,227,0.12)', padding: '20px 24px' }}>
            <SectionLabel>Recent Messages</SectionLabel>
          </div>
          <div className="divide-y divide-[rgba(247,241,227,0.12)]">
            {recentMessages.length === 0 && (
              <p className="px-6 py-10 text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,241,227,0.55)' }}>
                No messages yet
              </p>
            )}
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-6 py-4"
                style={{ borderLeft: msg.isRead ? 'none' : '3px solid #E3B23C' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 15,
                      color: '#F7F1E3',
                      fontWeight: msg.isRead ? 400 : 600,
                    }}
                  >
                    {msg.name}
                  </p>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,241,227,0.55)', flexShrink: 0 }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,241,227,0.6)', marginTop: 6 }} className="truncate">
                  {msg.subject}
                </p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(247,241,227,0.12)', padding: '14px 24px' }}>
            <Link href="/admin/messages" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#E3B23C' }}>
              View all →
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
