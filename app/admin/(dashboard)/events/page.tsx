import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminPageHeader, { adminPrimaryLinkStyle } from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: { _count: { select: { tickets: true } } },
  })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Events"
        title="Concerts & appearances"
        subtitle="Create events, sell tickets, and track attendance from one place."
        action={
          <Link href="/admin/events/new" style={adminPrimaryLinkStyle()}>
            + New Event
          </Link>
        }
      />

      {events.length === 0 ? (
        <div className="border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B] p-16 text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'rgba(247,241,227,0.6)', fontSize: 15 }}>No events yet.</p>
          <Link
            href="/admin/events/new"
            style={{ fontFamily: 'var(--font-sans)', color: '#E3B23C', fontSize: 14, marginTop: 12, display: 'inline-block' }}
          >
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B]" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(247,241,227,0.12)]">
                {['Poster', 'Event', 'Date', 'Venue', 'Tickets', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'rgba(247,241,227,0.55)',
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(247,241,227,0.12)]">
              {events.map((event) => (
                <tr key={event.id} className="transition hover:bg-[#20255A]">
                  <td className="px-4 py-3">
                    {event.posterImage ? (
                      <Image src={event.posterImage} alt={event.title} width={48} height={48} className="object-cover" />
                    ) : (
                      <div
                        className="flex items-center justify-center text-[#E3B23C]"
                        style={{
                          width: 48,
                          height: 48,
                          background: '#20255A',
                          border: '1px solid rgba(247,241,227,0.2)',
                          fontSize: 20,
                        }}
                      >
                        ♪
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 14, color: '#F7F1E3', fontWeight: 500 }}>{event.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.55)', marginTop: 2 }}>{event.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 13, color: '#F7F1E3' }}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    {event.eventTime && <p style={{ fontSize: 11, color: 'rgba(247,241,227,0.55)' }}>{event.eventTime}</p>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[rgba(247,241,227,0.7)]">{event.venue}</td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        fontSize: 14,
                        color: '#E3B23C',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                      }}
                    >
                      {event._count.tickets}
                    </span>
                    {event.totalTickets != null && (
                      <span style={{ fontSize: 12, color: 'rgba(247,241,227,0.45)' }}> / {event.totalTickets}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        background:
                          event.status === 'UPCOMING'
                            ? 'rgba(20,83,45,0.3)'
                            : event.status === 'CANCELLED'
                              ? 'rgba(127,29,29,0.3)'
                              : 'rgba(42,48,104,0.8)',
                        color:
                          event.status === 'UPCOMING'
                            ? '#4ade80'
                            : event.status === 'CANCELLED'
                              ? '#f87171'
                              : 'rgba(247,241,227,0.55)',
                        border: `1px solid ${
                          event.status === 'UPCOMING'
                            ? 'rgba(20,83,45,0.5)'
                            : event.status === 'CANCELLED'
                              ? 'rgba(127,29,29,0.5)'
                              : 'rgba(247,241,227,0.2)'
                        }`,
                      }}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="rounded-full border border-[rgba(247,241,227,0.2)] px-4 py-1.5 text-sm text-[#F7F1E3] transition hover:border-[#E3B23C] hover:text-[#E3B23C]"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/tickets`}
                        className="rounded-full border border-[rgba(247,241,227,0.2)] px-4 py-1.5 text-sm text-[#F7F1E3] transition hover:border-[#E3B23C] hover:text-[#E3B23C]"
                      >
                        Tickets
                      </Link>
                      <AdminDeleteButton endpoint={`/api/events/${event.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
