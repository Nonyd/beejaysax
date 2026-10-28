'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Event } from '@prisma/client'
import EventCard from '@/components/events/EventCard'
import FilterPills from '@/components/ui/FilterPills'

type Tab = 'upcoming' | 'past'

export default function EventsPageContent({
  upcomingEvents,
  pastEvents,
}: {
  upcomingEvents: Event[]
  pastEvents: Event[]
}) {
  const [tab, setTab] = useState<Tab>('upcoming')
  const list = tab === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <section className="bg-night py-16 md:py-24">
      <div className="site-shell">
        <FilterPills
          label="Show events"
          value={tab}
          onChange={setTab}
          options={[
            { label: 'Upcoming', value: 'upcoming', count: upcomingEvents.length },
            { label: 'Past', value: 'past', count: pastEvents.length },
          ]}
        />

        <div className="mt-12">
          {list.length === 1 ? (
            <EventCard event={list[0]} showViewButton={tab === 'past'} dimmed={tab === 'past'} wide />
          ) : list.length > 1 ? (
            <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
              {list.map((e) => (
                <EventCard key={e.id} event={e} showViewButton={tab === 'past'} dimmed={tab === 'past'} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
              <p className="font-display text-3xl text-ivory">
                {tab === 'upcoming' ? 'New dates are coming' : 'No past events yet'}
              </p>
              <p className="mx-auto mt-3 max-w-[44ch] font-body text-base text-ivory/65">
                {tab === 'upcoming'
                  ? 'Want BeeJay at your church or event? Send a booking request.'
                  : 'Events appear here once they have taken place.'}
              </p>
              {tab === 'upcoming' && (
                <Link
                  href="/contact?inquiry=booking"
                  className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-night no-underline hover:bg-gold-lt"
                >
                  Book BeeJay
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
