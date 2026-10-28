'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tier = {
  id: string
  name: string
  description: string | null
  price: number
  state: 'on_sale' | 'not_started' | 'ended' | 'sold_out'
  remaining: number | null
  maxPerOrder: number
  admits: number
}

const STATE_LABEL: Record<Tier['state'], string> = {
  on_sale: '',
  sold_out: 'Sold out',
  ended: 'Sales ended',
  not_started: 'Not on sale yet',
}

const label = 'mb-2 block font-body text-sm font-semibold text-ink'
const input =
  'w-full rounded-[14px] border border-ink/20 bg-white/70 px-4 py-3.5 font-body text-base text-ink outline-none transition-colors focus:border-clay focus:bg-white'
const stepBtn =
  'flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 font-body text-xl text-ink transition-colors hover:border-ink disabled:opacity-40'

export default function TicketPurchaseForm({
  eventId,
  tiers,
  currencySymbol,
  hasCoupons,
}: {
  eventId: string
  tiers: Tier[]
  currencySymbol: string
  hasCoupons: boolean
}) {
  const router = useRouter()
  const firstOnSale = tiers.find((t) => t.state === 'on_sale')
  const [tierId, setTierId] = useState(firstOnSale?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null)
  const [codeError, setCodeError] = useState('')
  const [checkingCode, setCheckingCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tier = tiers.find((t) => t.id === tierId)
  const maxQty = tier ? Math.max(1, Math.min(tier.maxPerOrder, tier.remaining ?? tier.maxPerOrder)) : 1
  const subtotal = (tier?.price ?? 0) * quantity
  const discount = applied ? Math.min(subtotal, applied.discount) : 0
  const total = subtotal - discount
  const money = (n: number) => (n === 0 ? 'Free' : `${currencySymbol}${n.toLocaleString()}`)

  function chooseTier(id: string) {
    setTierId(id)
    setQuantity(1)
    setApplied(null)
  }

  function changeQty(next: number) {
    setQuantity(Math.min(maxQty, Math.max(1, next)))
    setApplied(null) // percentage codes depend on the subtotal; re-apply to recalculate
  }

  async function applyCode() {
    if (!code.trim()) return
    setCheckingCode(true)
    setCodeError('')
    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, tierId, quantity, couponCode: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApplied({ code: data.code, discount: data.discount })
    } catch (e) {
      setApplied(null)
      setCodeError(e instanceof Error ? e.message : 'That code didn’t work.')
    } finally {
      setCheckingCode(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, tierId, quantity, firstName, lastName, email, phone, couponCode: applied?.code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Try again.')
        setLoading(false)
        return
      }
      if (data.status === 'payment' && data.authorizationUrl) {
        window.location.href = data.authorizationUrl // stays "loading" while Paystack opens
        return
      }
      router.push(`/tickets/order/${data.reference}`)
    } catch {
      setError('No connection. Check your network and try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8 rounded-[32px] bg-ivory p-6 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
      <fieldset>
        <legend className={label}>Choose your ticket</legend>
        <div className="space-y-3">
          {tiers.map((t) => {
            const disabled = t.state !== 'on_sale'
            const active = t.id === tierId
            const sub = active ? 'text-ivory/75' : 'text-ink/60'
            return (
              <label
                key={t.id}
                className={cn(
                  'flex cursor-pointer items-start justify-between gap-4 rounded-[18px] border px-5 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay',
                  active ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink',
                  disabled && 'cursor-not-allowed opacity-50 hover:border-ink/20'
                )}
              >
                <input type="radio" name="tier" value={t.id} checked={active} disabled={disabled} onChange={() => chooseTier(t.id)} className="sr-only" />
                <span className="min-w-0">
                  <span className="block font-body text-base font-semibold">{t.name}</span>
                  {t.description && <span className={cn('block font-body text-sm', sub)}>{t.description}</span>}
                  {t.admits > 1 && <span className={cn('block font-body text-sm', sub)}>Admits {t.admits} people</span>}
                  {disabled ? (
                    <span className="mt-1 block font-body text-sm font-semibold text-clay">{STATE_LABEL[t.state]}</span>
                  ) : t.remaining !== null && t.remaining <= 20 ? (
                    <span className={cn('mt-1 block font-body text-sm font-semibold', active ? 'text-gold' : 'text-clay')}>Only {t.remaining} left</span>
                  ) : null}
                </span>
                <span className="shrink-0 font-display text-2xl">{money(t.price)}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div>
        <p className={label} id="qty-label">
          How many?
        </p>
        <div className="flex items-center gap-4" role="group" aria-labelledby="qty-label">
          <button type="button" className={stepBtn} onClick={() => changeQty(quantity - 1)} disabled={quantity <= 1} aria-label="Fewer tickets">
            −
          </button>
          <span className="min-w-[2ch] text-center font-display text-3xl" aria-live="polite">
            {quantity}
          </span>
          <button type="button" className={stepBtn} onClick={() => changeQty(quantity + 1)} disabled={quantity >= maxQty} aria-label="More tickets">
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
            Email <span className="font-normal text-ink/55">(we send the tickets here)</span>
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

      {hasCoupons && subtotal > 0 && (
        <div>
          <label className={label} htmlFor="coupon">
            Discount code <span className="font-normal text-ink/55">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setApplied(null)
                setCodeError('')
              }}
              className={input}
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? 'coupon-error' : undefined}
            />
            <button
              type="button"
              onClick={applyCode}
              disabled={checkingCode || !code.trim()}
              className="shrink-0 rounded-full border border-ink/30 px-6 font-body font-semibold text-ink hover:border-ink disabled:opacity-50"
            >
              {checkingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </button>
          </div>
          {codeError && (
            <p id="coupon-error" className="mt-2 font-body text-sm text-clay-deep">
              {codeError}
            </p>
          )}
          {applied && (
            <p className="mt-2 font-body text-sm text-[#24563f]">
              {applied.code} applied: {money(discount)} off
            </p>
          )}
        </div>
      )}

      <div className="border-t-2 border-dashed border-ink/20 pt-6">
        {discount > 0 && (
          <div className="mb-2 flex justify-between font-body text-sm text-ink/70">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-body text-base text-ink/70">Total</span>
          <span className="font-display text-4xl">{money(total)}</span>
        </div>
        <p className="mt-2 font-body text-sm text-ink/60">
          {total > 0
            ? 'You’ll pay securely with Paystack (card, bank transfer or USSD). Your tickets, with QR codes for entry, are emailed as soon as payment is confirmed.'
            : 'Your tickets, with QR codes for entry, are emailed to you straight away.'}
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-[14px] bg-clay/10 px-4 py-3 font-body text-sm text-clay-deep">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !tier}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory transition-colors hover:bg-night disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? (
          total > 0 ? (
            'Opening Paystack'
          ) : (
            'Issuing tickets'
          )
        ) : total > 0 ? (
          <>
            <Lock className="h-4 w-4" aria-hidden /> Pay {money(total)}
          </>
        ) : quantity > 1 ? (
          `Get ${quantity} free tickets`
        ) : (
          'Get my free ticket'
        )}
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
