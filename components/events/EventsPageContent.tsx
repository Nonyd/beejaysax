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
      <div
        className="sticky z-30 border-b"
        style={{ top: 72, background: '#080808', borderColor: '#1E1E1E', height: 52 }}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-stretch px-6 md:px-12">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '0 24px',
              border: 'none',
              borderBottom: tab === 'upcoming' ? '2px solid #C9A84C' : '2px solid transparent',
              background: 'transparent',
              color: tab === 'upcoming' ? '#C9A84C' : '#555',
              cursor: 'pointer',
              transition: 'color 200ms',
            }}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '0 24px',
              border: 'none',
              borderBottom: tab === 'past' ? '2px solid #C9A84C' : '2px solid transparent',
              background: 'transparent',
              color: tab === 'past' ? '#C9A84C' : '#555',
              cursor: 'pointer',
              transition: 'color 200ms',
            }}
          >
            Past
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {list.map((e) => (
            <EventCard key={e.id} event={e} showViewButton={tab === 'past'} dimmed={tab === 'past'} />
          ))}
        </div>
        {list.length === 0 && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', textAlign: 'center', padding: '48px 0' }}>
            {tab === 'upcoming' ? 'No upcoming events listed yet.' : 'Past events will appear here.'}
          </p>
        )}
      </section>
    </>
  )
}
