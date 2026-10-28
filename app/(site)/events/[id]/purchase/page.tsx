import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Adire from '@/components/ui/Adire'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import TicketPurchaseForm from '@/components/events/TicketPurchaseForm'
import { prisma } from '@/lib/prisma'
import { getTierAvailability } from '@/lib/events/availability'
import { expireStaleOrders } from '@/lib/events/orders'
import { currencySymbol } from '@/lib/events/editor-data'

type Props = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findFirst({ where: { id, status: { not: 'DRAFT' } }, select: { title: true } })
  if (!event) return { title: 'Tickets' }
  return { title: `Tickets — ${event.title}` }
}

export default async function EventPurchasePage({ params }: Props) {
  const { id } = await params
  await expireStaleOrders()
  const avail = await getTierAvailability(id)
  if (!avail || avail.event.status === 'DRAFT') notFound()
  const { event, tiers } = avail
  const onSale = tiers.filter((t) => t.state === 'on_sale')

  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="#E3B23C" opacity={0.06} />
      <div className="site-shell relative">
        <div className="mx-auto max-w-[760px] py-16 md:py-24">
          <Link href={`/events/${id}`} className="font-body text-sm font-semibold text-gold no-underline hover:underline">
            Back to event details
          </Link>
          {onSale.length === 0 ? (
            <div className="mt-10 text-center">
              <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[0.95] text-ivory">
                {tiers.some((t) => t.state === 'not_started') ? 'Tickets aren’t on sale yet' : tiers.every((t) => t.state === 'sold_out') && tiers.length ? 'Sold out' : 'Ticket sales have closed'}
              </h1>
              <p className="mx-auto mt-4 max-w-[44ch] font-body text-lg text-ivory/75">
                {event.title}. Contact the team if you have questions about tickets.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <GoldButton href="/contact">Contact the team</GoldButton>
                <OutlineButton href={`/events/${id}`}>Back to the event</OutlineButton>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-8 font-body text-lg font-medium text-gold">Tickets for</p>
              <h1 className="mt-3 font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-[-0.02em] text-ivory">{event.title}</h1>
              <TicketPurchaseForm
                eventId={event.id}
                currencySymbol={currencySymbol(event.currency)}
                tiers={tiers.map((t) => ({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  price: t.price,
                  state: t.state,
                  remaining: t.remaining,
                  maxPerOrder: t.maxPerOrder,
                  admits: t.admits,
                }))}
                hasCoupons={(await prisma.coupon.count({ where: { isActive: true, OR: [{ eventId: id }, { eventId: null }] } })) > 0}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
