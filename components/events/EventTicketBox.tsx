'use client'

import Link from 'next/link'
import { useLiveTiers } from '@/components/events/useLiveTiers'

type Tier = {
  id: string
  name: string
  description: string | null
  price: number
  state: 'on_sale' | 'not_started' | 'ended' | 'sold_out'
  remaining: number | null
}

const stateLabel: Record<string, string> = { sold_out: 'Sold out', ended: 'Sales ended', not_started: 'Not on sale yet' }

/** Ticket list and buy button on the event page, kept current with live seat counts. */
export default function EventTicketBox({ eventId, currencySymbol, tiers: initial }: { eventId: string; currencySymbol: string; tiers: Tier[] }) {
  const tiers = useLiveTiers(eventId, initial)
  const canBuy = tiers.some((t) => t.state === 'on_sale')
  const soldOut = tiers.length > 0 && tiers.every((t) => t.state === 'sold_out')
  const allFree = tiers.length > 0 && tiers.every((t) => t.price === 0)
  const price = (n: number) => (n === 0 ? 'Free' : `${currencySymbol}${n.toLocaleString()}`)

  return (
    <>
      {tiers.length === 0 ? (
        <p className="font-body text-base text-ink/70">Tickets aren’t on sale yet.</p>
      ) : (
        <ul className="space-y-3">
          {tiers.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-body text-base font-semibold">{t.name}</p>
                {t.description && <p className="font-body text-sm text-ink/60">{t.description}</p>}
                {t.state !== 'on_sale' ? (
                  <p className="font-body text-sm font-semibold text-clay">{stateLabel[t.state]}</p>
                ) : t.remaining !== null && t.remaining <= 20 ? (
                  <p className="font-body text-sm font-semibold text-clay">Only {t.remaining} left</p>
                ) : null}
              </div>
              <p className={`shrink-0 font-display text-2xl ${t.state === 'on_sale' ? '' : 'text-ink/40 line-through'}`}>{price(t.price)}</p>
            </li>
          ))}
        </ul>
      )}

      {canBuy ? (
        <Link
          href={`/events/${eventId}/purchase`}
          className="mt-6 flex w-full justify-center rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory no-underline transition-colors hover:bg-night"
        >
          {allFree ? 'Register free' : 'Get tickets'}
        </Link>
      ) : (
        <Link
          href="/contact?inquiry=booking"
          className="mt-6 flex w-full justify-center rounded-full border border-ink/30 px-8 py-4 font-body text-base font-semibold text-ink no-underline hover:border-ink"
        >
          {soldOut ? 'Ask about tickets' : 'Book BeeJay for your event'}
        </Link>
      )}
    </>
  )
}
