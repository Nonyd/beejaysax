'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Event } from '@prisma/client'
import GoldButton from '@/components/ui/GoldButton'
import { Music } from 'lucide-react'
import { format } from 'date-fns'

export default function EventCard({ event, showViewButton }: { event: Event; showViewButton?: boolean }) {
  const router = useRouter()
  const day = format(event.eventDate, 'd')
  const month = format(event.eventDate, 'MMM').toUpperCase()
  const year = format(event.eventDate, 'yyyy')

  const badge =
    event.status === 'CANCELLED'
      ? 'bg-red-900 text-red-200'
      : event.status === 'PAST'
        ? 'bg-bjs-surface3 text-bjs-muted'
        : 'bg-bjs-gold text-bjs-black'

  const badgeLabel =
    event.status === 'CANCELLED' ? 'CANCELLED' : event.status === 'PAST' ? 'PAST' : 'UPCOMING'

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(`/events/${event.id}`)
      }}
      className="group cursor-pointer overflow-hidden border border-bjs-border bg-bjs-surface transition-all duration-300 hover:-translate-y-1 hover:border-bjs-gold hover:shadow-[0_0_40px_rgba(201,168,76,0.08)]"
    >
      <div className="relative aspect-video overflow-hidden">
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={`${event.title} — event poster`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bjs-surface2 to-bjs-black">
            <Music className="h-24 w-24 text-bjs-gold/20" strokeWidth={1} />
          </div>
        )}
        <span className={`absolute right-4 top-4 rounded px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide ${badge}`}>
          {badgeLabel}
        </span>
        <div className="absolute bottom-0 left-6 translate-y-1/2 border border-bjs-border bg-bjs-black px-4 py-3">
          <p className="font-serif text-[42px] leading-none text-bjs-gold">{day}</p>
          <p className="font-sans text-[11px] uppercase tracking-wide text-bjs-muted">{month}</p>
          <p className="font-sans text-[11px] text-bjs-muted">{year}</p>
        </div>
      </div>

      <div className="p-6 pt-10">
        <h3 className="font-serif text-[clamp(24px,3vw,40px)] font-medium leading-tight text-bjs-white line-clamp-2">
          {event.title}
        </h3>
        <p className="mt-2 font-sans text-[13px] text-bjs-muted">{event.venue}</p>
        <p className="font-sans text-[13px] text-bjs-muted">
          {event.city}, {event.country}
        </p>
        {event.eventTime && <p className="mt-1 font-sans text-[12px] text-bjs-white/50">{event.eventTime}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-bjs-border p-6 pt-4">
        <p className="font-serif text-lg text-bjs-gold">
          {event.isFree ? 'FREE ENTRY' : `₦${event.ticketPrice?.toLocaleString() ?? '—'}`}
        </p>
        <div onClick={(e) => e.stopPropagation()}>
          <GoldButton size="sm" href={`/events/${event.id}`}>
            {showViewButton ? 'View Event' : 'Get Tickets'}
          </GoldButton>
        </div>
      </div>
    </article>
  )
}
