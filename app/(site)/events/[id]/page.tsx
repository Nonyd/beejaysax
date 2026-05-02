import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { format } from 'date-fns'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await safeDb(() => prisma.event.findUnique({ where: { id } }), null)
  if (!event) return { title: { absolute: 'Event Not Found — BeeJay Sax' } }

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    title: { absolute: `${event.title} — BeeJay Sax` },
    description: `${event.title} at ${event.venue}, ${event.city} on ${formattedDate}. ${event.description?.slice(0, 100) ?? ''}`,
    openGraph: {
      title: event.title,
      description: `${event.venue} · ${event.city} · ${formattedDate}`,
      url: `https://beejaysax.com/events/${id}`,
      images: event.posterImage ? [{ url: event.posterImage, width: 1200, height: 630 }] : [],
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = await safeDb(() => prisma.event.findUnique({ where: { id } }), null)
  if (!event) notFound()

  const ticketCount = await safeDb(
    () =>
      prisma.ticket.count({
        where: { eventId: id, paymentStatus: { not: 'REFUNDED' } },
      }),
    0
  )
  const available = event.totalTickets != null ? Math.max(0, event.totalTickets - ticketCount) : null

  const mapsQuery = [event.address, event.city, event.country].filter(Boolean).join(', ')
  const mapsSrc = mapsQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed` : null

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com'
  const eventUrl = `${siteBase.replace(/\/$/, '')}/events/${event.id}`
  const waText = encodeURIComponent(`${event.title}\n${eventUrl}`)

  return (
    <>
      <section style={{ position: 'relative', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 64px', overflow: 'hidden' }} className="md:px-12">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {event.posterImage ? (
            <Image src={event.posterImage} alt={`${event.title} — event poster`} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0d0a02 0%, #1a1204 100%)' }} />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.75) 45%, transparent 100%)',
            }}
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1200px]">
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              margin: 0,
            }}
          >
            {format(event.eventDate, 'EEEE, MMMM d, yyyy')}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(38px,6vw,80px)',
              fontWeight: 600,
              color: '#F5F0E8',
              margin: '16px 0 0',
              maxWidth: '56rem',
            }}
          >
            {event.title}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', marginTop: 16 }}>
            {event.venue} · {event.city}, {event.country}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-5 md:px-12">
        <div className="space-y-8 md:col-span-3">
          {event.description && (
            <div>
              {event.description.split('\n').map((p) => (
                <p
                  key={p.slice(0, 48)}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: 'rgba(245,240,232,0.85)',
                    marginBottom: 16,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          )}
          <span
            style={{
              display: 'inline-flex',
              border: '1px solid #C9A84C',
              background: 'rgba(201,168,76,0.08)',
              padding: '8px 16px',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}
          >
            Featuring BeeJay Sax Live
          </span>
          {mapsSrc && (
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', border: '1px solid #1E1E1E' }}>
              <iframe title="Map" src={mapsSrc} style={{ width: '100%', height: '100%', border: 'none' }} loading="lazy" />
            </div>
          )}
        </div>

        <aside className="md:col-span-2">
          <div
            className="sticky"
            style={{
              top: 96,
              border: '1px solid #C9A84C',
              background: '#0F0F0F',
              padding: 32,
            }}
          >
            <SectionLabel style={{ marginBottom: 8 }}>Secure Your Seat</SectionLabel>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#F5F0E8', margin: '12px 0 0' }}>{event.title}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', margin: '8px 0 0' }}>
              {format(event.eventDate, 'MMM d, yyyy')}
              {event.eventTime ? ` · ${event.eventTime}` : ''}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', margin: '4px 0 0' }}>{event.venue}</p>

            <div style={{ marginTop: 24, borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
              {event.isFree ? (
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#C9A84C', margin: 0 }}>FREE ENTRY</p>
              ) : (
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#C9A84C', margin: 0 }}>
                  ₦{event.ticketPrice?.toLocaleString() ?? '—'}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#555', margin: '12px 0 0' }}>
                {available === null ? 'Open registration' : `${available} spots left`}
              </p>
            </div>

            {event.status === 'UPCOMING' && (available === null || available > 0) ? (
              <>
                <div style={{ marginTop: 24, width: '100%' }}>
                  <GoldButton href={`/events/${event.id}/purchase`} className="w-full justify-center">
                    {event.isFree ? 'Register free' : 'Get tickets'}
                  </GoldButton>
                </div>
                <Link
                  href="/contact?inquiry=booking"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: 16,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#555',
                    textDecoration: 'none',
                  }}
                >
                  Book / Enquire
                </Link>
              </>
            ) : event.status === 'UPCOMING' && available === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', textAlign: 'center', marginTop: 24 }}>
                Sold out
              </p>
            ) : (
              <div style={{ marginTop: 24 }}>
                <GoldButton href="/contact?inquiry=booking" className="w-full justify-center">
                  Book / Enquire
                </GoldButton>
              </div>
            )}

            <div
              style={{
                marginTop: 32,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                borderTop: '1px solid #1E1E1E',
                paddingTop: 24,
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
              }}
            >
              <Link href={`https://wa.me/?text=${waText}`} style={{ color: '#C9A84C' }} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </Link>
              <span style={{ color: '#1E1E1E' }}>|</span>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${event.title} ${eventUrl}`)}`}
                style={{ color: '#C9A84C' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 md:px-12">
        <Link href="/events" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#C9A84C', textDecoration: 'none' }}>
          ← All events
        </Link>
      </div>
    </>
  )
}
