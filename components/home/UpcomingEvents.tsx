'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'
import EventCard from '@/components/events/EventCard'
import { registerGSAP, fadeUpOnScroll } from '@/lib/animations'
import { bodyTextStyle, h1DisplaySplitStyle, h2TextStyle } from '@/lib/typography-styles'

export default function UpcomingEvents({ events }: { events: Event[] }) {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (headRef.current) fadeUpOnScroll(headRef.current)
  }, [])

  return (
    <section className="bg-bjs-black py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div ref={headRef} className="mb-16 flex min-w-0 flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="min-w-0 max-w-full">
            <SectionLabel>On Stage</SectionLabel>
            <div className="mt-3">
              <h2
                style={{
                  ...h1DisplaySplitStyle,
                  color: '#F5F0E8',
                  whiteSpace: 'nowrap',
                }}
              >
                Catch BeeJay
              </h2>
              <h2
                style={{
                  ...h1DisplaySplitStyle,
                  fontStyle: 'italic',
                  color: '#C9A84C',
                  whiteSpace: 'nowrap',
                }}
              >
                Live.
              </h2>
            </div>
          </div>
          <div className="hidden shrink-0 md:block">
            <OutlineButton href="/events">View All Events →</OutlineButton>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <span className="text-7xl opacity-20" aria-hidden>
              🎷
            </span>
            <p style={{ ...h2TextStyle, opacity: 0.3 }}>No upcoming events.</p>
            <p style={bodyTextStyle}>New dates coming soon.</p>
            <OutlineButton href="/contact">Get Notified</OutlineButton>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 20, marginTop: 48 }}
          >
            {events.map((e) => (
              <div key={e.id} className="min-w-0 w-full">
                <EventCard event={e} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <OutlineButton href="/events">View All Events →</OutlineButton>
        </div>
      </div>
    </section>
  )
}
