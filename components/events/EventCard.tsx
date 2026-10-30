'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event } from '@prisma/client'
import { format } from 'date-fns'
import Adire from '@/components/ui/Adire'
import { cn } from '@/lib/utils'

/**
 * Event as a paper ticket: ivory body, dashed tear line with punched notches, gold stub.
 * `notchColor` must match the section background so the notches read as cut-outs.
 */
export default function EventCard({
  event,
  showViewButton,
  dimmed,
  wide,
  notchColor = 'var(--night)',
}: {
  event: Event
  showViewButton?: boolean
  dimmed?: boolean
  /** Horizontal layout (poster, details, stub side by side) for a lone event spanning the container. */
  wide?: boolean
  notchColor?: string
}) {
  const router = useRouter()
  const href = `/events/${event.id}`
  const cta = showViewButton ? 'View event' : event.isFree ? 'Register free' : 'Get tickets'
  const price = event.isFree ? 'Free' : `₦${(event.ticketPrice ?? 0).toLocaleString()}`
  const statusBadge = event.status === 'CANCELLED' ? 'Cancelled' : event.status === 'PAST' ? 'Past event' : null

  const notch = 'absolute h-6 w-6 rounded-full'

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(href)
      }}
      className={cn(
        'group relative flex w-full cursor-pointer flex-col bg-ivory text-ink shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1',
        wide && 'md:flex-row',
        dimmed && 'opacity-60'
      )}
    >
      {/* poster */}
      <div className={cn('relative aspect-[16/10] shrink-0 overflow-hidden bg-ink', wide && 'md:aspect-auto md:w-[38%]')}>
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={`${event.title} poster`}
            fill
            style={{ objectFit: 'cover' }}
            sizes={wide ? '(max-width:768px) 100vw, 460px' : '(max-width:768px) 100vw, 400px'}
          />
        ) : (
          <>
            <Adire variant="field" color="var(--gold)" opacity={0.22} />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--clay) 45%, transparent), transparent 60%)' }}
            />
          </>
        )}
        {statusBadge && (
          <span className="absolute top-4 left-4 rounded-full bg-night/85 px-3 py-1 font-body text-xs font-semibold text-ivory">
            {statusBadge}
          </span>
        )}
      </div>

      {/* details */}
      <div className={cn('flex flex-1 flex-col p-6', wide && 'md:p-10')}>
        <p className="font-body text-sm font-semibold text-clay">{format(event.eventDate, 'EEEE, d MMMM yyyy')}</p>
        <h3
          // size before leading: tailwind-merge drops a leading-* that precedes a text-size class
          className={cn(
            'mt-2 font-display text-ink',
            wide ? 'text-[clamp(28px,3.2vw,44px)]' : 'text-[28px]',
            'leading-[1.05]'
          )}
        >
          {event.title}
        </h3>
        <p className="mt-3 font-body text-[15px] text-ink/70">
          {event.venue}, {event.city}
          {event.eventTime ? <span className="block">Doors {event.eventTime}</span> : null}
        </p>
        {wide && event.description && (
          <p className="mt-5 line-clamp-3 max-w-[52ch] font-body text-base leading-relaxed text-ink/75">{event.description}</p>
        )}
      </div>

      {/* tear line + notches */}
      <div
        aria-hidden
        className={cn(
          'relative mx-6 border-t-2 border-dashed border-ink/25',
          wide && 'md:mx-0 md:my-6 md:border-t-0 md:border-l-2'
        )}
      >
        <span className={cn(notch, '-top-3 -left-9', wide && 'md:-top-9 md:-left-3')} style={{ background: notchColor }} />
        <span
          className={cn(notch, '-top-3 -right-9', wide && 'md:top-auto md:right-auto md:-bottom-9 md:-left-3')}
          style={{ background: notchColor }}
        />
      </div>

      {/* stub */}
      <div
        className={cn(
          'flex items-center justify-between gap-4 bg-gold p-6',
          wide && 'md:w-[260px] md:flex-col md:items-start md:justify-center md:gap-6 md:p-8'
        )}
      >
        <div className="leading-none text-night">
          <span className="block font-display text-[44px]">{format(event.eventDate, 'd')}</span>
          <span className="mt-1 block font-body text-sm font-semibold">{format(event.eventDate, 'MMM yyyy')}</span>
        </div>
        <div className={cn('flex flex-col items-end gap-3', wide && 'md:items-start')}>
          <span className="font-display text-2xl text-night">{price}</span>
          <span onClick={(e) => e.stopPropagation()}>
            <Link
              href={href}
              className="inline-flex rounded-full bg-night px-5 py-2.5 font-body text-sm font-semibold text-ivory no-underline transition-colors group-hover:bg-ink"
            >
              {cta}
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
