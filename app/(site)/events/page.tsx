import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import EventsPageContent from '@/components/events/EventsPageContent'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'

export const metadata: Metadata = pageMetadata({
  title: 'Events & Concert Tickets — BeeJay Sax',
  description: 'Upcoming concerts and gospel events featuring BeeJay Sax live. Get tickets for the next Beejay Sax Live Concert.',
  path: '/events',
  shareTitle: 'BeeJay Sax — Live Events',
  shareDescription: 'Upcoming concerts, gospel events and live ministry appearances.',
})

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const h = await getContent('pageHeaders')
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
      <PageHero
        title={[h.eventsTitle]}
        intro={h.eventsIntro}
      />
      <EventsPageContent upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </>
  )
}
