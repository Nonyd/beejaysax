'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'
import EventCard from '@/components/events/EventCard'
import { registerGSAP, fadeUpOnScroll } from '@/lib/animations'

export default function UpcomingEvents({ events }: { events: Event[] }) {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (headRef.current) fadeUpOnScroll(headRef.current)
  }, [])

  return (
    <section className="bg-bjs-black py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
        <div ref={headRef} className="mb-16 flex min-w-0 flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="min-w-0 max-w-full">
            <SectionLabel>On Stage</SectionLabel>
            <h2 className="mt-3">
              <span className="h1-text block whitespace-nowrap text-bjs-white">Catch BeeJay</span>
              <span className="h1-text block whitespace-nowrap font-serif italic text-bjs-gold">Live.</span>
            </h2>
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
            <p className="h2-text opacity-30">No upcoming events.</p>
            <p className="body-text">New dates coming soon.</p>
            <OutlineButton href="/contact">Get Notified</OutlineButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
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
