import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fmt } from '@/lib/time'
import TicketActionsBar from '@/components/tickets/TicketActionsBar'
import Adire from '@/components/ui/Adire'
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

      <section className="relative -mt-[72px] overflow-hidden bg-night pt-[72px]">
        <Adire variant="field" color="#E3B23C" opacity={0.05} />
        <div className="ticket-print-root relative mx-auto max-w-[480px] px-6 py-16 pb-28">
          <div className="no-print mb-8 text-center">
            <Link href={`/events/${ev.id}`} className="font-body text-sm font-semibold text-gold no-underline hover:underline">
              Event details
            </Link>
          </div>

          <article className="bg-ivory text-ink shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <header className="bg-gold text-night">
              <div className="px-8 pt-7 pb-5 text-center">
                <p className="font-display text-[34px] leading-none">BeeJay Sax Live</p>
                <p className="mt-2 font-body text-sm font-semibold">
                  Official ticket{ticket.quantity > 1 ? `, admits ${ticket.quantity}` : ''}
                </p>
              </div>
              <Adire variant="band" color="#11142F" opacity={0.55} height={22} />
            </header>

            <div className="space-y-6 p-8">
              <div className="flex gap-4">
                {ev.posterImage ? (
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px]">
                    <Image src={ev.posterImage} alt={`${ev.title} poster`} fill className="object-cover" sizes="72px" />
                  </div>
                ) : null}
                <h1 className="min-w-0 flex-1 font-display text-[30px] leading-[1.05]">{ev.title}</h1>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 font-body text-[15px]">
                <div>
                  <dt className="text-sm text-ink/55">Date</dt>
                  <dd className="mt-0.5 font-semibold">{fmt(ev.eventDate, 'd MMM yyyy')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/55">Doors</dt>
                  <dd className="mt-0.5 font-semibold">{ev.eventTime || 'To be announced'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm text-ink/55">Venue</dt>
                  <dd className="mt-0.5 font-semibold">
                    {ev.venue}, {ev.city}, {ev.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/55">Ticket</dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-ink px-3 py-1 text-sm font-semibold text-ivory">{typeLabel(ticket.ticketType)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/55">Ticket number</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{ticket.ticketNumber}</dd>
                </div>
              </dl>

              <div className="border-t border-ink/15 pt-5 font-body">
                <p className="text-sm text-ink/55">Attendee</p>
                <p className="mt-0.5 text-lg font-semibold">
                  {ticket.firstName} {ticket.lastName}
                </p>
                <p className="text-sm text-ink/65">{ticket.email}</p>
              </div>
            </div>

            <div aria-hidden className="relative mx-8 border-t-2 border-dashed border-ink/25">
              <span className="absolute -top-3 -left-11 h-6 w-6 rounded-full bg-night" />
              <span className="absolute -top-3 -right-11 h-6 w-6 rounded-full bg-night" />
            </div>

            <div className="px-8 pt-7 pb-8 text-center">
              <div className="relative mx-auto w-[212px] rounded-[16px] bg-white p-4">
                <Image src={ticket.qrCode} alt="Ticket QR code" width={180} height={180} unoptimized className="mx-auto h-[180px] w-[180px]" />
                {ticket.isUsed ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[16px] bg-ivory/85">
                    <span className="-rotate-12 rounded-[8px] border-4 border-clay px-4 py-1 font-body text-xl font-bold text-clay">Used</span>
                  </div>
                ) : null}
              </div>
              <p className="mt-4 font-body text-sm text-ink/65">Show this code at the entrance</p>
              <p className="mt-1 font-body text-xs text-ink/45 tabular-nums">{tokenTail}</p>
            </div>

            <footer
              className={
                ticket.isUsed
                  ? 'bg-clay-deep px-6 py-4 text-center font-body text-sm font-semibold text-ivory'
                  : 'bg-[#2f6b4f] px-6 py-4 text-center font-body text-sm font-semibold text-ivory'
              }
            >
              {ticket.isUsed
                ? `This ticket was used${ticket.usedAt ? ` on ${fmt(ticket.usedAt, 'd MMM yyyy, h:mm a')}` : ''}`
                : 'Valid ticket'}
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
      </section>
    </>
  )
}
