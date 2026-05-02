import type { Metadata } from 'next'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import { h1TextStyle } from '@/lib/typography-styles'
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
        className="relative flex min-h-[360px] h-[45vh] flex-col justify-end overflow-hidden"
        style={{
          background: [
            'linear-gradient(135deg, #080808 0%, #0F0F0F 50%, #080808 100%)',
            'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(201,168,76,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-32 md:px-12">
          <SectionLabel>Events</SectionLabel>
          <h1 className="mt-3 text-bjs-white" style={h1TextStyle}>
            On Stage.
          </h1>
        </div>
      </section>

      <EventsPageContent upcomingEvents={upcomingEvents} pastEvents={pastEvents} />

      <div className="border-t border-bjs-border py-8 text-center">
        <Link href="/" className="font-sans text-sm text-bjs-gold transition-colors hover:text-bjs-gold-lt">
          ← Home
        </Link>
      </div>
    </>
  )
}
