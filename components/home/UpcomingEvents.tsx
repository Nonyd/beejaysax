import Link from 'next/link'
import EventCard from '@/components/events/EventCard'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'

export default async function UpcomingEvents() {
  const [c, site] = await Promise.all([getContent('homeSections'), getContent('site')])
  const events = await safeDb(
    () =>
      prisma.event.findMany({
        where: { status: 'UPCOMING' },
        orderBy: { eventDate: 'asc' },
        take: 3,
      }),
    []
  )

  return (
    <section className="bg-ink py-24 md:py-32">
      <div className="site-shell">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
            {c.eventsTitle.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          <Link
            href="/events"
            className="self-start font-body text-base font-semibold text-gold underline decoration-gold/40 underline-offset-[6px] transition-colors hover:decoration-gold md:self-auto"
          >
            {c.eventsLink}
          </Link>
        </div>

        {events.length === 1 ? (
          <EventCard event={events[0]} wide notchColor="#1B1F4B" />
        ) : events.length > 1 ? (
          // auto-fit collapses empty tracks, so 2 or 3 tickets always share the full container width
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
            {events.map((e) => (
              <EventCard key={e.id} event={e} notchColor="#1B1F4B" />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
            <p className="font-display text-3xl text-ivory">{c.eventsEmptyTitle}</p>
            <p className="mx-auto mt-3 max-w-[44ch] font-body text-base text-ivory/65">
              {c.eventsEmptyText}
            </p>
            <Link
              href="/contact?inquiry=booking"
              className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-night no-underline hover:bg-gold-lt"
            >
              {site.bookLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
