import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Adire from '@/components/ui/Adire'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import TicketPurchaseForm from '@/components/events/TicketPurchaseForm'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } })
  if (!event) return { title: 'Tickets' }
  return { title: `Tickets — ${event.title}` }
}

export default async function EventPurchasePage({ params }: Props) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event || event.status !== 'UPCOMING') notFound()

  const sold = await prisma.ticket.count({
    where: {
      eventId: id,
      paymentStatus: { not: 'REFUNDED' },
    },
  })
  const remaining = event.totalTickets != null ? Math.max(0, event.totalTickets - sold) : null

  if (remaining !== null && remaining === 0) {
    return (
      <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
        <Adire variant="field" color="#E3B23C" opacity={0.06} />
        <div className="site-shell relative"><div className="mx-auto max-w-[760px] py-24 text-center">
          <h1 className="font-display text-[clamp(44px,6vw,72px)] leading-[0.95] text-ivory">Sold out</h1>
          <p className="mx-auto mt-4 max-w-[44ch] font-body text-lg text-ivory/75">
            Every ticket for {event.title} has gone. Contact the team to ask about returns or future dates.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <GoldButton href="/contact?inquiry=booking">Contact the team</GoldButton>
            <OutlineButton href={`/events/${id}`}>Back to the event</OutlineButton>
          </div>
        </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="#E3B23C" opacity={0.06} />
      <div className="site-shell relative"><div className="mx-auto max-w-[760px] py-16 md:py-24">
        <Link href={`/events/${id}`} className="font-body text-sm font-semibold text-gold no-underline hover:underline">
          Back to event details
        </Link>
        <p className="mt-8 font-body text-lg font-medium text-gold">{event.isFree ? 'Register for' : 'Tickets for'}</p>
        <h1 className="mt-3 font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-[-0.02em] text-ivory">{event.title}</h1>
        <TicketPurchaseForm
          eventId={event.id}
          isFree={event.isFree}
          ticketPrice={event.ticketPrice}
          remaining={remaining}
        />
      </div>
      </div>
    </section>
  )
}
