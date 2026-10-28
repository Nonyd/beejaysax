import type { Metadata } from 'next'
import Adire from '@/components/ui/Adire'
import ArchPhoto from '@/components/ui/ArchPhoto'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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


  const canBuy = event.status === 'UPCOMING' && (available === null || available > 0)
  const soldOut = event.status === 'UPCOMING' && available === 0
  const details: [string, string][] = [
    ['Date', format(event.eventDate, 'EEEE, d MMMM yyyy')],
    ...(event.eventTime ? ([['Doors', event.eventTime]] as [string, string][]) : []),
    ['Venue', `${event.venue}, ${event.city}`],
  ]

  return (
    <>
      <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
        <Adire variant="field" color="#E3B23C" opacity={0.06} />
        <div className="site-shell relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="min-w-0">
            <Link href="/events" className="font-body text-sm font-semibold text-gold no-underline hover:underline">
              All events
            </Link>
            <p className="mt-8 font-body text-lg font-medium text-gold">{format(event.eventDate, 'EEEE, d MMMM yyyy')}</p>
            <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(48px,7vw,104px)] leading-[0.92] tracking-[-0.03em] text-ivory">
              {event.title}
            </h1>
            <p className="mt-6 font-body text-lg text-ivory/75">
              {event.venue}, {event.city}, {event.country}
            </p>
          </div>

          <div className="mx-auto w-full max-w-[300px] lg:max-w-[340px]">
            {event.posterImage ? (
              <ArchPhoto src={event.posterImage} alt={`${event.title} poster`} sizes="340px" priority />
            ) : (
              // date seal stands in for a poster until one is uploaded
              <div className="relative mx-auto aspect-square w-[78%]">
                <svg aria-hidden viewBox="0 0 200 200" className="animate-halo absolute inset-[-12%] h-[124%] w-[124%]">
                  <circle cx="100" cy="100" r="96" fill="none" stroke="#E3B23C" strokeWidth="2.2" strokeDasharray="0.1 7.6" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-gold text-night">
                  <span className="font-display text-[clamp(72px,9vw,112px)] leading-none">{format(event.eventDate, 'd')}</span>
                  <span className="mt-1 font-body text-lg font-semibold">{format(event.eventDate, 'MMMM yyyy')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <Adire variant="band" color="#E3B23C" opacity={0.6} height={32} />
      </section>

      <section className="bg-night py-16 md:py-24">
        <div className="site-shell grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="min-w-0 space-y-12">
            {event.description && (
              <div className="max-w-[62ch] space-y-5 font-body text-lg leading-relaxed text-ivory/85">
                {event.description.split('\n').filter(Boolean).map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
            )}

            <div>
              <h2 className="font-display text-4xl text-ivory">Getting there</h2>
              <p className="mt-3 font-body text-base text-ivory/70">
                {[event.venue, event.address, event.city, event.country].filter(Boolean).join(', ')}
              </p>
              {mapsSrc && (
                <div className="mt-6 aspect-video overflow-hidden rounded-[24px] border border-line">
                  <iframe title={`Map to ${event.venue}`} src={mapsSrc} className="h-full w-full border-0" loading="lazy" />
                </div>
              )}
            </div>
          </div>

          <aside className="min-w-0">
            <div className="sticky top-24 bg-ivory text-ink shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
              <div className="p-8">
                <p className="font-body text-sm font-semibold text-clay">Your seat</p>
                <p className="mt-2 font-display text-[28px] leading-[1.1]">{event.title}</p>
                <dl className="mt-6 space-y-3 font-body text-[15px]">
                  {details.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[72px_1fr] gap-3">
                      <dt className="text-ink/55">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div aria-hidden className="relative mx-8 border-t-2 border-dashed border-ink/25">
                <span className="absolute -top-3 -left-11 h-6 w-6 rounded-full bg-night" />
                <span className="absolute -top-3 -right-11 h-6 w-6 rounded-full bg-night" />
              </div>

              <div className="p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-4xl">
                    {event.isFree ? 'Free entry' : `₦${event.ticketPrice?.toLocaleString() ?? '—'}`}
                  </p>
                  <p className="font-body text-sm text-ink/60">
                    {available === null ? 'Tickets available' : soldOut ? 'Sold out' : `${available} left`}
                  </p>
                </div>

                {canBuy ? (
                  <Link
                    href={`/events/${event.id}/purchase`}
                    className="mt-6 flex w-full justify-center rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory no-underline transition-colors hover:bg-night"
                  >
                    {event.isFree ? 'Register free' : 'Get tickets'}
                  </Link>
                ) : (
                  <Link
                    href="/contact?inquiry=booking"
                    className="mt-6 flex w-full justify-center rounded-full border border-ink/30 px-8 py-4 font-body text-base font-semibold text-ink no-underline hover:border-ink"
                  >
                    {soldOut ? 'Ask about tickets' : 'Book BeeJay for your event'}
                  </Link>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/15 pt-5 font-body text-sm">
                  <span className="text-ink/55">Share</span>
                  <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-clay-deep hover:underline">
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${event.title} ${eventUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-clay-deep hover:underline"
                  >
                    X (Twitter)
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
