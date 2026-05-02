'use client'

import { useState } from 'react'
import Link from 'next/link'
import GoldButton from '@/components/ui/GoldButton'
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

  if (done) {
    return (
      <div className="mt-10 border border-bjs-gold bg-bjs-surface p-8 text-center shadow-[0_0_60px_rgba(201,168,76,0.12)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-bjs-gold text-bjs-gold">
          <span className="font-serif text-2xl">✓</span>
        </div>
        <p className="mt-6 font-serif text-xl text-bjs-white">You&apos;re on the list!</p>
        <p className="mt-3 font-sans text-sm text-bjs-muted">
          {done.emailSent
            ? `Your ticket has been sent to ${done.email}. Check your inbox (and spam).`
            : `We could not send email (${done.emailError ?? 'configuration'}). You can still open your ticket below.`}
        </p>
        {done.token ? (
          <GoldButton href={`/tickets/${done.token}`} className="mt-8 w-full justify-center">
            View my ticket
          </GoldButton>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8 border border-bjs-border bg-bjs-surface p-8">
      {!isFree ? (
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-bjs-gold">Ticket type</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(Object.keys(TYPE_LABELS) as TicketTypeOption[]).map((t) => (
              <label
                key={t}
                className={cn(
                  'cursor-pointer border p-4 font-sans text-sm transition-colors',
                  ticketType === t ? 'border-bjs-gold bg-bjs-gold-dim text-bjs-white' : 'border-bjs-border text-bjs-muted hover:border-bjs-border-lt'
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
        </div>
      ) : null}

      <div>
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-bjs-gold">Quantity</p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            className="h-10 w-10 border border-bjs-border font-sans text-lg text-bjs-white hover:border-bjs-gold"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center font-sans text-bjs-white">{quantity}</span>
          <button
            type="button"
            className="h-10 w-10 border border-bjs-border font-sans text-lg text-bjs-white hover:border-bjs-gold"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="font-sans text-[11px] uppercase tracking-wide text-bjs-muted" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 w-full border border-bjs-border bg-bjs-black px-4 py-3 font-sans text-bjs-white outline-none focus:border-bjs-gold"
          />
        </div>
        <div>
          <label className="font-sans text-[11px] uppercase tracking-wide text-bjs-muted" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-2 w-full border border-bjs-border bg-bjs-black px-4 py-3 font-sans text-bjs-white outline-none focus:border-bjs-gold"
          />
        </div>
      </div>

      <div>
        <label className="font-sans text-[11px] uppercase tracking-wide text-bjs-muted" htmlFor="email">
          Email (ticket sent here)
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border border-bjs-border bg-bjs-black px-4 py-3 font-sans text-bjs-white outline-none focus:border-bjs-gold"
        />
      </div>

      <div>
        <label className="font-sans text-[11px] uppercase tracking-wide text-bjs-muted" htmlFor="phone">
          Phone <span className="text-bjs-border">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full border border-bjs-border bg-bjs-black px-4 py-3 font-sans text-bjs-white outline-none focus:border-bjs-gold"
        />
      </div>

      <div className="border-t border-bjs-border pt-6">
        <div className="flex items-baseline justify-between font-sans">
          <span className="text-sm text-bjs-muted">Total</span>
          <span className="font-serif text-2xl text-bjs-gold">
            {isFree ? 'FREE' : `₦${total.toLocaleString()}`}
          </span>
        </div>
        {!isFree ? (
          <p className="mt-2 font-sans text-[11px] leading-relaxed text-bjs-muted">
            Checkout completes your reservation. Wire a live payment provider (e.g. Paystack) when you&apos;re ready for
            production collections.
          </p>
        ) : null}
      </div>

      {error ? <p className="font-sans text-sm text-red-400">{error}</p> : null}

      <GoldButton type="submit" disabled={loading} className="w-full justify-center">
        {loading ? 'Processing…' : isFree ? 'Complete registration' : 'Complete purchase'}
      </GoldButton>

      <p className="font-sans text-center text-[11px] text-bjs-muted">
        Questions?{' '}
        <Link href="/contact?inquiry=booking" className="text-bjs-gold hover:underline">
          Contact us
        </Link>
      </p>
    </form>
  )
}
