'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event } from '@prisma/client'
import { format } from 'date-fns'

export default function EventCard({
  event,
  showViewButton,
  dimmed,
}: {
  event: Event
  showViewButton?: boolean
  dimmed?: boolean
}) {
  const router = useRouter()
  const day = format(event.eventDate, 'd')
  const monthYear = `${format(event.eventDate, 'MMM')} ${format(event.eventDate, 'yyyy')}`

  const badgeStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    fontFamily: 'var(--font-sans)',
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    ...(event.status === 'CANCELLED'
      ? { background: 'rgba(127,29,29,0.85)', color: '#fecaca' }
      : event.status === 'PAST'
        ? { background: '#1E1E1E', color: '#4A4A4A' }
        : { background: '#C9A84C', color: '#080808' }),
  }

  const badgeLabel =
    event.status === 'CANCELLED' ? 'CANCELLED' : event.status === 'PAST' ? 'PAST' : 'UPCOMING'

  const cta = showViewButton ? 'View Event' : event.isFree ? 'Register' : 'Get Tickets'

  return (
    <div
      role="link"
      tabIndex={0}
      className="w-full"
      style={{
        background: '#0F0F0F',
        border: '1px solid #1E1E1E',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 300ms ease',
        display: 'flex',
        flexDirection: 'column',
        opacity: dimmed ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E1E'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
      onClick={() => router.push(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(`/events/${event.id}`)
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0 }}>
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={`${event.title} — event poster`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0d0a02, #161616)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 36, opacity: 0.12 }} aria-hidden>
              🎷
            </span>
          </div>
        )}

        <span style={badgeStyle}>{badgeLabel}</span>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: 'rgba(8,8,8,0.9)',
            padding: '10px 16px',
            borderTop: '1px solid #2A2A2A',
            borderRight: '1px solid #2A2A2A',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              fontWeight: 700,
              color: '#C9A84C',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {day}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#555',
              margin: '3px 0 0',
            }}
          >
            {monthYear}
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.3,
            color: '#F5F0E8',
            margin: '0 0 8px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {event.title}
        </h3>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#555', margin: 0 }}>
          {event.venue} · {event.city}
        </p>
        {event.eventTime && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#333', marginTop: 4 }}>
            {event.eventTime}
          </p>
        )}
      </div>

      <div
        style={{
          padding: '16px 20px',
          marginTop: 16,
          borderTop: '1px solid #141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            fontWeight: 700,
            color: '#C9A84C',
          }}
        >
          {event.isFree ? 'FREE' : `₦${(event.ticketPrice ?? 0).toLocaleString()}`}
        </span>
        <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex' }}>
          <Link
            href={`/events/${event.id}`}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '8px 16px',
              textDecoration: 'none',
            }}
          >
            {cta}
          </Link>
        </span>
      </div>
    </div>
  )
}
