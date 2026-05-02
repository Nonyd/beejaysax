import type { Metadata } from 'next'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import EventCard from '@/components/events/EventCard'
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
          take: 12,
        }),
      []
    ),
  ])

  return (
    <>
      <section className="relative flex min-h-[50vh] flex-col justify-end bg-gradient-to-t from-bjs-black via-bjs-black/90 to-transparent px-8 pb-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Events</SectionLabel>
          <h1 className="mt-6 font-serif text-[clamp(52px,9vw,120px)] font-bold leading-[0.9] text-bjs-white">On Stage.</h1>
          <p className="mt-4 max-w-xl font-sans text-bjs-muted">Gospel events, concerts, and live ministry moments.</p>
        </div>
      </section>

      <section className="border-t border-bjs-border bg-bjs-surface py-16">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="font-serif text-2xl text-bjs-white">Upcoming</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {upcomingEvents.length === 0 && (
            <p className="mt-8 font-sans text-bjs-muted">No upcoming events listed yet.</p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="font-serif text-2xl text-bjs-white">Past</h2>
          <div className="mt-10 grid gap-6 opacity-70 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((e) => (
              <EventCard key={e.id} event={e} showViewButton />
            ))}
          </div>
          {pastEvents.length === 0 && (
            <p className="mt-8 font-sans text-bjs-muted">Past events will appear here.</p>
          )}
        </div>
      </section>

      <div className="border-t border-bjs-border py-8 text-center">
        <Link href="/" className="font-sans text-sm text-bjs-gold hover:underline">
          ← Home
        </Link>
      </div>
    </>
  )
}
