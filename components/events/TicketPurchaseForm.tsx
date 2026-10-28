'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type TicketTypeOption = 'GENERAL' | 'VIP' | 'VVIP'

const TYPE_LABELS: Record<TicketTypeOption, string> = {
  GENERAL: 'General',
  VIP: 'VIP',
  VVIP: 'VVIP',
}

export default function TicketPurchaseForm({
  eventId,
  isFree,
  ticketPrice,
  remaining,
}: {
  eventId: string
  isFree: boolean
  ticketPrice: number | null
  remaining: number | null
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [ticketType, setTicketType] = useState<TicketTypeOption>('GENERAL')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ email: string; token: string; emailSent: boolean; emailError?: string } | null>(
    null
  )

  const maxQty = remaining != null ? Math.min(10, Math.max(1, remaining)) : 10
  const unit = isFree ? 0 : ticketPrice ?? 0
  const total = unit * quantity

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          ticketType: isFree ? 'FREE' : ticketType,
          quantity,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setDone({
        email,
        token: String(data.primaryToken ?? ''),
        emailSent: Boolean(data.emailSent),
        emailError: typeof data.emailError === 'string' ? data.emailError : undefined,
      })
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const label = 'mb-2 block font-body text-sm font-semibold text-ink'
  const input =
    'w-full rounded-[14px] border border-ink/20 bg-white/70 px-4 py-3.5 font-body text-base text-ink outline-none transition-colors focus:border-clay focus:bg-white'
  const stepBtn =
    'flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 font-body text-xl text-ink transition-colors hover:border-ink disabled:opacity-40'

  if (done) {
    return (
      <div className="mt-10 rounded-[32px] bg-ivory p-8 text-center text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold font-display text-3xl text-night">
          ✓
        </div>
        <p className="mt-6 font-display text-4xl">You&apos;re on the list</p>
        <p className="mx-auto mt-3 max-w-[42ch] font-body text-base text-ink/70">
          {done.emailSent
            ? `Your ticket is on its way to ${done.email}. If it isn't in your inbox in a few minutes, check spam.`
            : "We couldn't email your ticket just now, but it's ready below. Save or print it and bring it to the door."}
        </p>
        {done.token ? (
          <Link
            href={`/tickets/${done.token}`}
            className="mt-8 inline-flex w-full justify-center rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory no-underline hover:bg-night"
          >
            View my ticket
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8 rounded-[32px] bg-ivory p-6 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
      {!isFree ? (
        <fieldset>
          <legend className={label}>Ticket type</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(TYPE_LABELS) as TicketTypeOption[]).map((t) => (
              <label
                key={t}
                className={cn(
                  'cursor-pointer rounded-[14px] border px-4 py-3.5 text-center font-body text-base font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay',
                  ticketType === t ? 'border-ink bg-ink text-ivory' : 'border-ink/25 text-ink hover:border-ink'
                )}
              >
                <input
                  type="radio"
                  name="ticketType"
                  value={t}
                  checked={ticketType === t}
                  onChange={() => setTicketType(t)}
                  className="sr-only"
                />
                {TYPE_LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div>
        <p className={label} id="qty-label">
          How many tickets?
        </p>
        <div className="flex items-center gap-4" role="group" aria-labelledby="qty-label">
          <button
            type="button"
            className={stepBtn}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Fewer tickets"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center font-display text-3xl" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className={stepBtn}
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            aria-label="More tickets"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="firstName">
            First name
          </label>
          <input id="firstName" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="lastName">
            Last name
          </label>
          <input id="lastName" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="email">
            Email <span className="font-normal text-ink/55">(we send the ticket here)</span>
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="phone">
            Phone <span className="font-normal text-ink/55">(optional)</span>
          </label>
          <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-ink/20 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-body text-base text-ink/70">Total</span>
          <span className="font-display text-4xl">{isFree ? 'Free' : `₦${total.toLocaleString()}`}</span>
        </div>
        <p className="mt-2 font-body text-sm text-ink/60">
          Your ticket is issued instantly and emailed to you with a QR code for entry at the door.
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-[14px] bg-clay/10 px-4 py-3 font-body text-sm text-clay-deep">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory transition-colors hover:bg-night disabled:opacity-60"
      >
        {loading ? 'Processing' : isFree ? 'Complete registration' : quantity > 1 ? `Get ${quantity} tickets` : 'Get my ticket'}
      </button>

      <p className="text-center font-body text-sm text-ink/60">
        Questions?{' '}
        <Link href="/contact?inquiry=booking" className="font-semibold text-clay-deep hover:underline">
          Contact the team
        </Link>
      </p>
    </form>
  )
}
