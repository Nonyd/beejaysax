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
  const available =
    event.totalTickets != null ? Math.max(0, event.totalTickets - ticketCount) : null

  const mapsQuery = [event.address, event.city, event.country].filter(Boolean).join(', ')
  const mapsSrc = mapsQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`
    : null

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com'
  const eventUrl = `${siteBase.replace(/\/$/, '')}/events/${event.id}`
  const waText = encodeURIComponent(`${event.title}\n${eventUrl}`)

  return (
    <>
      <section className="relative flex min-h-[60vh] flex-col justify-end px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          {event.posterImage ? (
            <Image
              src={event.posterImage}
              alt={`${event.title} — event poster`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: 'linear-gradient(135deg, #0d0a02 0%, #1a1204 100%)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bjs-black via-bjs-black/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-bjs-gold">
            {format(event.eventDate, 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">
            {event.title}
          </h1>
          <p className="mt-4 font-sans text-bjs-muted">
            {event.venue} · {event.city}, {event.country}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-8 py-16 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          {event.description && (
            <div className="prose prose-invert max-w-none font-sans text-base leading-relaxed text-bjs-white/85">
              {event.description.split('\n').map((p) => (
                <p key={p.slice(0, 40)} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          )}
          <span className="inline-flex rounded border border-bjs-gold bg-bjs-gold-dim px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-bjs-gold">
            Featuring BeeJay Sax Live
          </span>
          {mapsSrc && (
            <div className="aspect-video overflow-hidden border border-bjs-border">
              <iframe title="Map" src={mapsSrc} className="h-full w-full" loading="lazy" />
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-28 border border-bjs-gold bg-bjs-surface p-8">
            <SectionLabel className="border-none pl-0">Secure Your Seat</SectionLabel>
            <p className="mt-4 font-serif text-xl text-bjs-white">{event.title}</p>
            <p className="mt-2 font-sans text-sm text-bjs-muted">
              {format(event.eventDate, 'MMM d, yyyy')}
              {event.eventTime ? ` · ${event.eventTime}` : ''}
            </p>
            <p className="mt-2 font-sans text-sm text-bjs-muted">{event.venue}</p>

            <div className="mt-6 border-t border-bjs-border pt-6">
              {event.isFree ? (
                <p className="font-serif text-2xl text-bjs-gold">FREE ENTRY</p>
              ) : (
                <p className="font-serif text-2xl text-bjs-gold">
                  ₦{event.ticketPrice?.toLocaleString() ?? '—'}
                </p>
              )}
              <p className="mt-3 font-sans text-[13px] text-bjs-muted">
                {available === null ? 'Open registration' : `${available} spots left`}
              </p>
            </div>

            {event.status === 'UPCOMING' && (available === null || available > 0) ? (
              <>
                <GoldButton href={`/events/${event.id}/purchase`} className="mt-6 w-full justify-center">
                  {event.isFree ? 'Register free' : 'Get tickets'}
                </GoldButton>
                <Link
                  href="/contact?inquiry=booking"
                  className="mt-4 block text-center font-sans text-[11px] uppercase tracking-wide text-bjs-muted transition-colors hover:text-bjs-gold"
                >
                  Book / Enquire
                </Link>
              </>
            ) : event.status === 'UPCOMING' && available === 0 ? (
              <p className="mt-6 text-center font-sans text-sm text-bjs-muted">Sold out</p>
            ) : (
              <GoldButton href="/contact?inquiry=booking" className="mt-6 w-full justify-center">
                Book / Enquire
              </GoldButton>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-bjs-border pt-6 font-sans text-[11px]">
              <Link
                href={`https://wa.me/?text=${waText}`}
                className="text-bjs-gold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Link>
              <span className="text-bjs-border">|</span>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${event.title} ${eventUrl}`)}`}
                className="text-bjs-gold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Share
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <div className="mx-auto max-w-7xl px-8 pb-16">
        <Link href="/events" className="font-sans text-sm text-bjs-gold hover:underline">
          ← All events
        </Link>
      </div>
    </>
  )
}
