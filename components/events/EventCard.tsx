'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event } from '@prisma/client'
import { Music } from 'lucide-react'
import { format } from 'date-fns'

export default function EventCard({ event, showViewButton, dimmed }: { event: Event; showViewButton?: boolean; dimmed?: boolean }) {
  const router = useRouter()
  const day = format(event.eventDate, 'd')
  const month = format(event.eventDate, 'MMM').toUpperCase()

  const badgeClass =
    event.status === 'CANCELLED'
      ? 'bg-[rgba(127,29,29,0.8)] text-red-300'
      : event.status === 'PAST'
        ? 'bg-bjs-surface3 text-bjs-muted'
        : 'bg-bjs-gold text-bjs-black'

  const badgeLabel =
    event.status === 'CANCELLED' ? 'CANCELLED' : event.status === 'PAST' ? 'PAST' : 'UPCOMING'

  const cta = showViewButton ? 'View Event' : 'Get Tickets'

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(`/events/${event.id}`)
      }}
      className={`group cursor-pointer overflow-hidden border border-bjs-border bg-bjs-surface transition-all duration-300 ease-out hover:-translate-y-[3px] hover:border-bjs-gold ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={`${event.title} — event poster`}
            fill
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0F0F0F_0%,#161616_100%)]">
            <Music className="h-12 w-12 text-bjs-gold/15" strokeWidth={1} aria-hidden />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 px-2.5 py-1 font-sans text-[9px] font-medium uppercase tracking-[0.15em] ${badgeClass}`}
        >
          {badgeLabel}
        </span>
        <div className="absolute bottom-0 left-0 border-r border-t border-bjs-border bg-[rgba(8,8,8,0.9)] px-4 py-2.5 backdrop-blur-[10px]">
          <p className="font-serif text-[36px] font-bold leading-none text-bjs-gold">{day}</p>
          <p className="mt-0.5 font-sans text-[9px] uppercase tracking-[0.15em] text-bjs-muted">{month}</p>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold leading-[1.3] text-bjs-white line-clamp-2">{event.title}</h3>
        <p className="mt-2 font-sans text-xs text-bjs-muted">
          {event.venue} · {event.city}
        </p>
        {event.eventTime && <p className="mt-1 font-sans text-[11px] text-[#2A2A2A]">{event.eventTime}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-[#141414] px-5 pb-5 pt-4">
        <div>
          {event.isFree ? (
            <span className="font-sans text-[11px] font-medium uppercase tracking-wide text-bjs-gold">FREE</span>
          ) : (
            <span className="font-serif text-lg text-bjs-gold">₦{event.ticketPrice?.toLocaleString() ?? '—'}</span>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/events/${event.id}`}
            className="inline-block border border-[rgba(201,168,76,0.3)] px-3.5 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-bjs-gold transition-all duration-200 hover:border-bjs-gold hover:bg-bjs-gold hover:text-bjs-black"
          >
            {cta}
          </Link>
        </div>
      </div>
    </article>
  )
}
