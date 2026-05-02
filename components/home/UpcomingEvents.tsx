'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import OutlineButton from '@/components/ui/OutlineButton'
import EventCard from '@/components/events/EventCard'
import { Music } from 'lucide-react'
import { registerGSAP, fadeUpOnScroll } from '@/lib/animations'

export default function UpcomingEvents({ events }: { events: Event[] }) {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (headRef.current) fadeUpOnScroll(headRef.current)
  }, [])

  return (
    <section className="bg-bjs-black py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div ref={headRef} className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SectionLabel>On Stage</SectionLabel>
            <h2 className="mt-6 font-serif text-[clamp(52px,9vw,120px)] font-bold leading-[0.9] tracking-[-0.02em] text-bjs-white">
              Catch BeeJay
              <br />
              <span className="text-bjs-gold">Live.</span>
            </h2>
          </div>
          <div className="hidden lg:block">
            <OutlineButton href="/events">View All Events</OutlineButton>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-6 py-16 text-center">
            <Music className="h-16 w-16 text-bjs-gold/40" strokeWidth={1} />
            <p className="font-serif text-2xl text-bjs-white">No upcoming events.</p>
            <p className="max-w-md font-sans text-bjs-muted">New dates coming soon. Stay tuned.</p>
            <OutlineButton href="/contact?inquiry=general">Get Notified</OutlineButton>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
