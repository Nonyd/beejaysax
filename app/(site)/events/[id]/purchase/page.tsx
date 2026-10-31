import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Adire from '@/components/ui/Adire'
import PurchasePanel from '@/components/events/PurchasePanel'
import { prisma } from '@/lib/prisma'
import { getTierAvailability } from '@/lib/events/availability'
import { currencySymbol } from '@/lib/events/editor-data'

type Props = { params: Promise<{ id: string }> }

// Cached like the event page (see there). The form loads live seat counts itself, and checkout
// re-checks every seat inside a locked transaction, so a cached page can never oversell.
export const revalidate = 60

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findFirst({ where: { id, status: { not: 'DRAFT' } }, select: { title: true } })
  // A checkout step: keep it out of search results, but let crawlers follow links back to the event.
  const robots = { index: false, follow: true }
  if (!event) return { title: 'Tickets', robots }
  return { title: `Tickets — ${event.title}`, robots }
}

export default async function EventPurchasePage({ params }: Props) {
  const { id } = await params
  const avail = await getTierAvailability(id)
  if (!avail || avail.event.status === 'DRAFT') notFound()
  const { event, tiers } = avail
  const hasCoupons = (await prisma.coupon.count({ where: { isActive: true, OR: [{ eventId: id }, { eventId: null }] } })) > 0

  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.06} />
      <div className="site-shell relative">
        <div className="mx-auto max-w-[760px] py-16 md:py-24">
          <Link href={`/events/${id}`} className="font-body text-sm font-semibold text-gold no-underline hover:underline">
            Back to event details
          </Link>
          <PurchasePanel
            eventId={event.id}
            eventTitle={event.title}
            currency={event.currency}
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
            hasCoupons={hasCoupons}
          />
        </div>
      </div>
    </section>
  )
}
