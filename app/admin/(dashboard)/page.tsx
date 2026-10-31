import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import AdminPageHeader, { adminOutlineLinkStyle } from '@/components/admin/AdminPageHeader'
import { CalendarPlus, Disc3, ImagePlus, MessageSquareText, ScanLine, Wallet } from 'lucide-react'
import { requireAdmin } from '@/lib/admin-auth'
import { ADMIN_NAV, can } from '@/lib/permissions'
import { getRevenueReport, money } from '@/lib/revenue'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin()
  const { denied } = await searchParams
  const show = {
    events: can(admin, 'events'),
    revenue: can(admin, 'revenue'),
    releases: can(admin, 'releases'),
    gallery: can(admin, 'gallery'),
    messages: can(admin, 'messages'),
  }
  // Each section's figures are only queried for admins who can open that section.
  const when = <T,>(allowed: boolean, query: () => Promise<T>, fallback: T) => (allowed ? query() : Promise.resolve(fallback))

  const [
    upcomingEvents,
    soldTickets,
    freeTickets,
    usedTickets,
    revenue,
    releaseCount,
    galleryCount,
    unreadMessages,
    recentTickets,
    recentMessages,
  ] = await Promise.all([
    when(show.events, () => prisma.event.count({ where: { status: 'UPCOMING' } }), 0),
    // Sold = tickets on live, paid orders. Test payments and tickets made outside checkout don't count.
    when(show.events, () => prisma.order.aggregate({ where: { status: 'PAID', paymentMode: 'live' }, _sum: { quantity: true } }).then((r) => r._sum.quantity ?? 0), 0),
    when(show.events, () => prisma.order.aggregate({ where: { status: 'FREE' }, _sum: { quantity: true } }).then((r) => r._sum.quantity ?? 0), 0),
    when(show.events, () => prisma.ticket.count({ where: { isUsed: true, orderId: { not: null } } }), 0),
    when(show.revenue, () => getRevenueReport({ mode: 'live' }).then((r) => r.totals), []),
    when(show.releases, () => prisma.release.count(), 0),
    when(show.gallery, () => prisma.galleryImage.count(), 0),
    when(show.messages, () => prisma.contactMessage.count({ where: { isRead: false } }), 0),
    when(show.events, () => prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { event: true } }), []),
    when(show.messages, () => prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }), []),
  ])

  // Main currency first; any others are listed under it.
  const [mainRevenue, ...otherRevenue] = [...revenue].sort((a, b) => (a.currency === 'NGN' ? -1 : b.currency === 'NGN' ? 1 : b.collected - a.collected))

  const stats = [
    { label: 'Upcoming Events', value: upcomingEvents, sub: 'concerts scheduled', allowed: show.events },
    {
      label: 'Tickets Sold',
      value: soldTickets,
      sub: `${freeTickets ? `${freeTickets} free or complimentary · ` : ''}${usedTickets} used at door`,
      allowed: show.events,
    },
    {
      label: 'Net Revenue',
      value: mainRevenue ? money(mainRevenue.net, mainRevenue.currency) : '₦0',
      sub: [
        'after Paystack fees and refunds',
        ...otherRevenue.map((r) => `plus ${money(r.net, r.currency)}`),
      ].join(' · '),
      isText: true,
      href: '/admin/revenue',
      allowed: show.revenue,
    },
    { label: 'Unread Messages', value: unreadMessages, sub: 'awaiting reply', allowed: show.messages },
    { label: 'Releases', value: releaseCount, sub: 'in discography', allowed: show.releases },
    { label: 'Gallery Images', value: galleryCount, sub: 'uploaded', allowed: show.gallery },
  ].filter((s) => s.allowed)

  const quickLinks = ADMIN_NAV.filter((item) => item.href !== '/admin' && item.permission && can(admin, item.permission))

  // The things done most often, as one-tap shortcuts.
  const actions = [
    { href: '/admin/events/new', label: 'New event', Icon: CalendarPlus, allowed: show.events },
    { href: '/admin/checkin', label: 'Scan tickets', Icon: ScanLine, allowed: can(admin, 'checkin') },
    { href: '/admin/revenue', label: 'Revenue', Icon: Wallet, allowed: show.revenue },
    { href: '/admin/messages', label: 'Messages', Icon: MessageSquareText, allowed: show.messages },
    { href: '/admin/releases/new', label: 'New release', Icon: Disc3, allowed: show.releases },
    { href: '/admin/gallery', label: 'Add photos', Icon: ImagePlus, allowed: show.gallery },
  ].filter((a) => a.allowed)

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
        <p className="mb-8 rounded-[14px] border border-warn/40 px-4 py-3 text-[14px] text-warn">
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

      {/* On phones the quick actions come first: they are what you tap; the figures follow. */}
      <div className="flex flex-col">
      <div className="order-2 mb-8 grid grid-cols-2 gap-3 sm:order-1 sm:gap-4 lg:mb-10 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              border: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)',
              background: 'var(--ink)',
              transition: 'border-color 200ms, box-shadow 200ms',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
            className={`min-w-0 rounded-[18px] p-4 hover:border-ivory/20 sm:rounded-none sm:px-7 sm:py-6 ${stat.isText ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <SectionLabel className="mb-3">{stat.label}</SectionLabel>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: stat.isText ? 'clamp(26px,6vw,30px)' : 'clamp(34px,9vw,44px)',
                color: 'var(--gold)',
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              {stat.value}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'color-mix(in srgb, var(--ivory) 60%, transparent)', fontSize: 13, marginTop: 10 }}>{stat.sub}</p>
            {'href' in stat && stat.href && (
              <Link href={stat.href} style={{ display: 'inline-block', marginTop: 12, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--gold)' }}>
                See revenue →
              </Link>
            )}
          </div>
        ))}
      </div>

      {actions.length > 0 && (
        <nav aria-label="Quick actions" className="order-1 mb-8 sm:order-2 lg:mb-12">
          <p className="mb-3 text-[13px] font-semibold text-ivory/60 sm:hidden">Quick actions</p>
          <ul className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {actions.map((a, i) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className={`flex h-full flex-col items-center gap-2 rounded-[18px] border border-ivory/10 bg-ink px-1 py-3 text-center no-underline active:scale-[0.97] sm:flex-row sm:rounded-full sm:px-6 sm:py-3 ${
                    i === 0 ? 'sm:border-gold sm:bg-gold sm:text-night' : 'sm:bg-transparent'
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-[14px] sm:h-auto sm:w-auto sm:bg-transparent ${i === 0 ? 'bg-gold text-night' : 'bg-gold/12 text-gold sm:text-current'}`}>
                    <a.Icon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
                  </span>
                  <span className={`text-[11px] leading-tight font-semibold sm:text-[14px] ${i === 0 ? 'text-ivory sm:text-night' : 'text-ivory'}`}>{a.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        {show.events && (
        <div className="rounded-[18px] lg:rounded-none" style={{ border: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', background: 'var(--ink)', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: '20px 24px' }}>
            <SectionLabel>Recent Registrations</SectionLabel>
          </div>
          <div className="divide-y divide-ivory/12">
            {recentTickets.length === 0 && (
              <p className="px-6 py-10 text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)' }}>
                No tickets yet
              </p>
            )}
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ivory)' }}>
                    {ticket.firstName} {ticket.lastName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'color-mix(in srgb, var(--ivory) 60%, transparent)', marginTop: 4 }}>
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
                    background: ticket.isUsed ? 'color-mix(in srgb, var(--danger) 14%, transparent)' : 'color-mix(in srgb, var(--success) 14%, transparent)',
                    color: ticket.isUsed ? 'var(--danger)' : 'var(--success)',
                    border: `1px solid ${ticket.isUsed ? 'color-mix(in srgb, var(--danger) 40%, transparent)' : 'color-mix(in srgb, var(--success) 40%, transparent)'}`,
                  }}
                >
                  {ticket.isUsed ? 'Used' : 'Valid'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: '14px 24px' }}>
            <Link href="/admin/events" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--gold)' }}>
              View all →
            </Link>
          </div>
        </div>
        )}

        {show.messages && (
        <div className="rounded-[18px] lg:rounded-none" style={{ border: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', background: 'var(--ink)', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: '20px 24px' }}>
            <SectionLabel>Recent Messages</SectionLabel>
          </div>
          <div className="divide-y divide-ivory/12">
            {recentMessages.length === 0 && (
              <p className="px-6 py-10 text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)' }}>
                No messages yet
              </p>
            )}
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-6 py-4"
                style={{ borderLeft: msg.isRead ? 'none' : '3px solid var(--gold)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 15,
                      color: 'var(--ivory)',
                      fontWeight: msg.isRead ? 400 : 600,
                    }}
                  >
                    {msg.name}
                  </p>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)', flexShrink: 0 }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'color-mix(in srgb, var(--ivory) 60%, transparent)', marginTop: 6 }} className="truncate">
                  {msg.subject}
                </p>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: '14px 24px' }}>
            <Link href="/admin/messages" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--gold)' }}>
              View all →
            </Link>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
