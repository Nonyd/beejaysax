import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SectionLabel from '@/components/ui/SectionLabel'
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
      <section className="mx-auto max-w-lg px-8 py-32">
        <SectionLabel className="border-none pl-0">Sold out</SectionLabel>
        <p className="mt-4 font-sans text-bjs-muted">This event has no tickets left.</p>
        <Link href={`/events/${id}`} className="mt-10 inline-block font-sans text-sm text-bjs-gold hover:underline">
          ← Back to event
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-8 py-24 pb-32">
      <Link href={`/events/${id}`} className="font-sans text-sm text-bjs-gold hover:underline">
        ← Event details
      </Link>
      <SectionLabel className="mt-8 border-none pl-0">{event.isFree ? 'Register' : 'Get tickets'}</SectionLabel>
      <h1 className="mt-4 font-serif text-3xl text-bjs-white md:text-4xl">{event.title}</h1>
      <TicketPurchaseForm
        eventId={event.id}
        isFree={event.isFree}
        ticketPrice={event.ticketPrice}
        remaining={remaining}
      />
    </section>
  )
}
