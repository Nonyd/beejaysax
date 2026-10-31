'use client'

import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import TicketPurchaseForm from '@/components/events/TicketPurchaseForm'
import { useLiveTiers } from '@/components/events/useLiveTiers'

type Tier = Parameters<typeof TicketPurchaseForm>[0]['tiers'][number]

/** The checkout form, or the "not on sale" message, decided from live availability. */
export default function PurchasePanel({
  eventId,
  eventTitle,
  currency,
  currencySymbol,
  tiers: initial,
  hasCoupons,
}: {
  eventId: string
  eventTitle: string
  currency: string
  currencySymbol: string
  tiers: Tier[]
  hasCoupons: boolean
}) {
  const tiers = useLiveTiers(eventId, initial)

  if (!tiers.some((t) => t.state === 'on_sale')) {
    return (
      <div className="mt-10 text-center">
        <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[0.95] text-ivory">
          {tiers.some((t) => t.state === 'not_started') ? 'Tickets aren’t on sale yet' : tiers.every((t) => t.state === 'sold_out') && tiers.length ? 'Sold out' : 'Ticket sales have closed'}
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] font-body text-lg text-ivory/75">
          {eventTitle}. Contact the team if you have questions about tickets.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <GoldButton href="/contact">Contact the team</GoldButton>
          <OutlineButton href={`/events/${eventId}`}>Back to the event</OutlineButton>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="mt-8 font-body text-lg font-medium text-gold">Tickets for</p>
      <h1 className="mt-3 font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-[-0.02em] text-ivory">{eventTitle}</h1>
      <TicketPurchaseForm eventId={eventId} currency={currency} currencySymbol={currencySymbol} tiers={tiers} hasCoupons={hasCoupons} />
    </>
  )
}
