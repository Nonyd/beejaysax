import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import TicketActionsBar from '@/components/tickets/TicketActionsBar'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ token: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: { event: { select: { title: true } } },
  })
  return {
    title: ticket ? `Ticket — ${ticket.event.title}` : 'Ticket',
    robots: { index: false, follow: false },
  }
}

function typeLabel(t: string): string {
  switch (t) {
    case 'VIP':
      return 'VIP'
    case 'VVIP':
      return 'VVIP'
    case 'FREE':
      return 'Free'
    default:
      return 'General'
  }
}

export default async function TicketViewPage({ params }: Props) {
  const { token } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: { event: true },
  })

  if (!ticket) notFound()

  const ev = ticket.event
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
  const ticketPageUrl = `${siteBase}/tickets/${token}`
  const tokenTail = token.slice(-8)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * { visibility: hidden !important; }
            .ticket-print-root, .ticket-print-root * { visibility: visible !important; }
            .ticket-print-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
            .no-print { display: none !important; }
          }
        `,
        }}
      />

      <div className="ticket-print-root mx-auto max-w-md px-6 py-16 pb-32">
        <div className="no-print mb-10 text-center">
          <Link href={`/events/${ev.id}`} className="font-sans text-sm text-bjs-gold hover:underline">
            ← Event details
          </Link>
        </div>

        <article className="overflow-hidden border-2 border-bjs-gold shadow-[0_0_60px_rgba(201,168,76,0.15)]">
          <div className="bg-bjs-gold px-6 py-5 text-center text-bjs-black">
            <p className="font-serif text-[clamp(22px,5vw,28px)] italic leading-tight">BeeJay Sax Live</p>
            <p className="mt-2 font-sans text-[10px] font-semibold uppercase tracking-[0.35em]">Official ticket</p>
          </div>

          <div className="relative border-t-2 border-dashed border-bjs-gold/40 bg-bjs-surface">
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-bjs-black" aria-hidden />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-bjs-black" aria-hidden />
          </div>

          <div className="space-y-6 bg-bjs-surface p-8">
            <div className="flex gap-4">
              {ev.posterImage ? (
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden border border-bjs-border">
                  <Image src={ev.posterImage} alt={`${ev.title} — event poster`} fill className="object-cover" sizes="72px" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-[22px] leading-snug text-bjs-white">{ev.title}</h1>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-sans text-[13px]">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-bjs-muted">Date</dt>
                <dd className="mt-1 text-bjs-white">{format(ev.eventDate, 'MMM d, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-bjs-muted">Time</dt>
                <dd className="mt-1 text-bjs-white">{ev.eventTime || '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] uppercase tracking-wider text-bjs-muted">Venue</dt>
                <dd className="mt-1 text-bjs-white">{ev.venue}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] uppercase tracking-wider text-bjs-muted">City</dt>
                <dd className="mt-1 text-bjs-white">
                  {ev.city}, {ev.country}
                </dd>
              </div>
            </dl>

            <span className="inline-flex rounded-full border border-bjs-gold bg-bjs-gold-dim px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-wide text-bjs-gold">
              {typeLabel(ticket.ticketType)}
            </span>

            <div className="border-t border-bjs-border pt-6 font-sans">
              <p className="text-[10px] uppercase tracking-wider text-bjs-muted">Attendee</p>
              <p className="mt-2 text-lg text-bjs-white">
                {ticket.firstName} {ticket.lastName}
              </p>
              <p className="mt-1 text-sm text-bjs-muted">{ticket.email}</p>
              <p className="mt-6 font-mono text-[13px] text-bjs-muted"># {ticket.ticketNumber}</p>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-bjs-gold/40 bg-bjs-surface">
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-bjs-black" aria-hidden />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-bjs-black" aria-hidden />
          </div>

          <div className="relative bg-bjs-surface px-8 pb-8 pt-6">
            <div className="relative mx-auto flex w-[200px] justify-center bg-bjs-white p-3">
              <Image
                src={ticket.qrCode}
                alt="Ticket QR code"
                width={180}
                height={180}
                unoptimized
                className="h-[180px] w-[180px]"
              />
              {ticket.isUsed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-bjs-black/80">
                  <span className="-rotate-12 border-4 border-red-500 px-4 py-2 font-sans text-xl font-bold uppercase tracking-widest text-red-400">
                    Used
                  </span>
                </div>
              ) : null}
            </div>
            <p className="mt-4 text-center font-sans text-[11px] text-bjs-muted">Scan at entrance</p>
            <p className="mt-1 text-center font-mono text-[10px] text-bjs-muted/80">{tokenTail}</p>
          </div>

          <footer
            className={
              ticket.isUsed
                ? 'border-t border-red-900/50 bg-red-950/30 px-6 py-4 text-center font-sans text-sm text-red-300/90'
                : 'border-t border-emerald-900/50 bg-emerald-950/25 px-6 py-4 text-center font-sans text-sm text-emerald-300/90'
            }
          >
            {ticket.isUsed
              ? `This ticket was used${ticket.usedAt ? ` · ${format(ticket.usedAt, 'MMM d, yyyy · h:mm a')}` : ''}`
              : '✓ Valid ticket'}
          </footer>
        </article>

        <TicketActionsBar
          token={token}
          eventTitle={ev.title}
          venue={ev.venue}
          city={ev.city}
          country={ev.country}
          ticketPageUrl={ticketPageUrl}
        />
      </div>
    </>
  )
}
