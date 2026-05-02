'use client'

import { useState } from 'react'
import type { Event } from '@prisma/client'
import EventCard from '@/components/events/EventCard'

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
    <>
      <div className="sticky top-16 z-30 border-b border-bjs-border bg-bjs-black">
        <div className="mx-auto flex max-w-6xl gap-0 px-6 md:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`border-b-2 px-6 py-4 font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
              tab === 'upcoming'
                ? 'border-bjs-gold text-bjs-gold'
                : 'border-transparent text-bjs-muted hover:text-bjs-white'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`border-b-2 px-6 py-4 font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
              tab === 'past'
                ? 'border-bjs-gold text-bjs-gold'
                : 'border-transparent text-bjs-muted hover:text-bjs-white'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} event={e} showViewButton={tab === 'past'} dimmed={tab === 'past'} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-12 text-center font-sans text-bjs-muted">
            {tab === 'upcoming' ? 'No upcoming events listed yet.' : 'Past events will appear here.'}
          </p>
        )}
      </section>
    </>
  )
}
