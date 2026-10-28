import type { Metadata } from 'next'
import EventsPageContent from '@/components/events/EventsPageContent'
import PageHero from '@/components/ui/PageHero'
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
      <PageHero
        title={['On stage']}
        intro="Concerts and worship nights with BeeJay Sax. Buy your ticket here and it arrives by email with a QR code for the door."
      />
      <EventsPageContent upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </>
  )
}
