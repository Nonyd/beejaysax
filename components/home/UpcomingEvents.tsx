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
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 56,
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 16,
              }}
            >
              On Stage
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(40px,7vw,88px)',
                fontWeight: 700,
                lineHeight: 0.92,
                margin: 0,
              }}
            >
              <span style={{ display: 'block', color: '#F5F0E8' }}>Catch BeeJay</span>
              <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Live.</span>
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:block"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '12px 24px',
            }}
          >
            View All Events →
          </Link>
        </div>

        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                fontStyle: 'italic',
                color: 'rgba(245,240,232,0.2)',
                marginBottom: 16,
              }}
            >
              No upcoming events
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#333' }}>
              New dates coming soon. Stay tuned.
            </p>
          </div>
        )}

        <div className="md:hidden" style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            href="/events"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '12px 28px',
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
