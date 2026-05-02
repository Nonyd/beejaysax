import Link from 'next/link'
import EventCard from '@/components/events/EventCard'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

export default async function UpcomingEvents() {
  const events = await safeDb(
    () =>
      prisma.event.findMany({
        where: { status: 'UPCOMING' },
        orderBy: { eventDate: 'asc' },
        take: 3,
      }),
    []
  )

  return (
    <section style={{ background: '#080808', paddingTop: 120, paddingBottom: 120 }}>
      <div className="site-shell">
        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end"
          style={{ marginBottom: 48, borderBottom: '1px solid #1E1E1E', paddingBottom: 32 }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 12,
              }}
            >
              On Stage
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px,6.5vw,80px)',
                fontWeight: 700,
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              <span style={{ display: 'block', color: '#F5F0E8' }}>Catch BeeJay</span>
              <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Live.</span>
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
              border: '1px solid rgba(201,168,76,0.35)',
              padding: '14px 28px',
              alignSelf: 'end',
              whiteSpace: 'nowrap',
            }}
          >
            View All Events →
          </Link>
        </div>

        {events.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 26,
                fontStyle: 'italic',
                color: 'rgba(245,240,232,0.25)',
                marginBottom: 16,
              }}
            >
              No upcoming events
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: '#555' }}>
              New dates coming soon. Stay tuned.
            </p>
          </div>
        )}

        <div className="mt-10 md:hidden" style={{ textAlign: 'center' }}>
          <Link
            href="/events"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
              border: '1px solid rgba(201,168,76,0.35)',
              padding: '14px 28px',
              display: 'inline-block',
            }}
          >
            View All Events →
          </Link>
        </div>
      </div>
    </section>
  )
}
