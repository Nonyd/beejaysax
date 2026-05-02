import type { Metadata } from 'next'
import Link from 'next/link'
import EventsPageContent from '@/components/events/EventsPageContent'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

export const metadata: Metadata = {
  title: { absolute: 'Events — BeeJay Sax' },
  description:
    'Upcoming concerts and gospel events featuring BeeJay Sax live. Book your tickets for the next Beejay Sax Live Concert.',
  openGraph: {
    title: 'BeeJay Sax — Live Events',
    description: 'Upcoming concerts, gospel events, and live ministry appearances.',
    url: 'https://beejaysax.com/events',
  },
}

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    safeDb(
      () =>
        prisma.event.findMany({
          where: { status: 'UPCOMING' },
          orderBy: { eventDate: 'asc' },
        }),
      []
    ),
    safeDb(
      () =>
        prisma.event.findMany({
          where: { status: 'PAST' },
          orderBy: { eventDate: 'desc' },
          take: 24,
        }),
      []
    ),
  ])

  return (
    <>
      <section
        style={{
          height: 320,
          position: 'relative',
          overflow: 'hidden',
          background: '#0F0F0F',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 12,
              }}
            >
              Events
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(48px,8vw,96px)',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              <span style={{ display: 'block' }}>On Stage.</span>
            </h1>
          </div>
        </div>
      </section>

      <EventsPageContent upcomingEvents={upcomingEvents} pastEvents={pastEvents} />

      <div style={{ borderTop: '1px solid #1E1E1E', padding: '32px 0', textAlign: 'center' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: '#C9A84C',
            textDecoration: 'none',
          }}
        >
          ← Home
        </Link>
      </div>
    </>
  )
}
