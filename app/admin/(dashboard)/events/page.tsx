import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: { _count: { select: { tickets: true } } },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Events</h2>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage concerts and appearances</p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-[#C9A84C] px-6 py-2.5 font-semibold text-[#080808] transition hover:bg-[#E8C96D]"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="border border-[#1E1E1E] bg-[#0F0F0F] p-16 text-center">
          <p style={{ color: '#444', fontSize: 14 }}>No events yet.</p>
          <Link href="/admin/events/new" style={{ color: '#C9A84C', fontSize: 13, marginTop: 8, display: 'block' }}>
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-[#1E1E1E] bg-[#0F0F0F]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {['Poster', 'Event', 'Date', 'Venue', 'Tickets', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#555',
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {events.map((event) => (
                <tr key={event.id} className="transition hover:bg-[#161616]">
                  <td className="px-4 py-3">
                    {event.posterImage ? (
                      <Image src={event.posterImage} alt={event.title} width={48} height={48} className="object-cover" />
                    ) : (
                      <div
                        className="flex items-center justify-center text-[#C9A84C]"
                        style={{
                          width: 48,
                          height: 48,
                          background: '#161616',
                          border: '1px solid #2A2A2A',
                          fontSize: 20,
                        }}
                      >
                        ♪
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 500 }}>{event.title}</p>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{event.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 13, color: '#F5F0E8' }}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    {event.eventTime && <p style={{ fontSize: 11, color: '#555' }}>{event.eventTime}</p>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#888]">{event.venue}</td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        fontSize: 14,
                        color: '#C9A84C',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                      }}
                    >
                      {event._count.tickets}
                    </span>
                    {event.totalTickets != null && (
                      <span style={{ fontSize: 12, color: '#444' }}> / {event.totalTickets}</span>
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
                              : 'rgba(30,30,30,0.8)',
                        color:
                          event.status === 'UPCOMING'
                            ? '#4ade80'
                            : event.status === 'CANCELLED'
                              ? '#f87171'
                              : '#555',
                        border: `1px solid ${
                          event.status === 'UPCOMING'
                            ? 'rgba(20,83,45,0.5)'
                            : event.status === 'CANCELLED'
                              ? 'rgba(127,29,29,0.5)'
                              : '#2A2A2A'
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
                        className="border border-[#2A2A2A] px-3 py-1.5 text-xs text-white transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}/tickets`}
                        className="border border-[#2A2A2A] px-3 py-1.5 text-xs text-white transition hover:border-[#C9A84C] hover:text-[#C9A84C]"
                        style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
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
