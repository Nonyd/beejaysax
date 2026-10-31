import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrder, expireStaleOrders, isBusyError, OrderError, priceWithCoupon, siteBase } from '@/lib/events/orders'
import { sendTicketsEmail } from '@/lib/events/notify'
import { initializePayment, PaymentError } from '@/lib/payments/paystack'
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit'
import { processingFee } from '@/lib/payments/fees'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PENDING_PER_EMAIL = 2

/**
 * Checkout. Free orders get tickets straight away; paid orders hold seats and return a
 * Paystack payment link. Tickets for paid orders are issued only after payment is verified.
 */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const buyer = {
    firstName: s(b.firstName, 80),
    lastName: s(b.lastName, 80),
    email: s(b.email, 200).toLowerCase(),
    phone: s(b.phone, 40) || undefined,
  }
  if (!buyer.firstName || !buyer.lastName) return NextResponse.json({ error: 'Add your first and last name.' }, { status: 400 })
  if (!EMAIL_RE.test(buyer.email)) return NextResponse.json({ error: 'Add a valid email address. Your ticket is sent there.' }, { status: 400 })
  const quantity = Math.floor(Number(b.quantity ?? 1))
  if (!Number.isFinite(quantity) || quantity < 1) return NextResponse.json({ error: 'Choose how many tickets.' }, { status: 400 })

  // Every unpaid checkout holds seats, so a script must not be able to hold the whole event.
  if (!rateLimit('checkout-ip', clientIp(req), 10, 10 * 60_000) || !rateLimit('checkout-email', buyer.email, 5, 10 * 60_000)) {
    return NextResponse.json(tooMany(), { status: 429 })
  }
  const holding = await prisma.order.count({ where: { email: buyer.email, status: 'PENDING', expiresAt: { gt: new Date() } } })
  if (holding >= MAX_PENDING_PER_EMAIL) {
    return NextResponse.json(
      { error: 'You already have unpaid checkouts open. Finish paying for one, or wait a few minutes for them to expire.' },
      { status: 429 }
    )
  }

  await expireStaleOrders()
  try {
    const { order, tickets } = await createOrder({
      eventId: s(b.eventId, 40),
      tierId: s(b.tierId, 40),
      quantity,
      buyer,
      couponCode: s(b.couponCode, 40) || undefined,
    })

    if (order.status === 'FREE') {
      const mail = await sendTicketsEmail(tickets.map((t) => t.id))
      return NextResponse.json({
        status: 'issued',
        reference: order.reference,
        emailSent: mail.failed.length === 0,
        primaryToken: tickets[0]?.qrToken,
      })
    }

    try {
      const pay = await initializePayment({
        email: order.email,
        amount: order.total,
        currency: order.currency,
        reference: order.reference,
        callbackUrl: `${siteBase()}/tickets/order/${order.reference}`,
        metadata: { orderId: order.id, eventId: order.eventId, quantity: order.quantity },
      })
      // Tag the order with the Paystack mode now, so test checkouts never mix into live revenue.
      await prisma.order.update({ where: { id: order.id }, data: { paymentMode: pay.mode } })
      return NextResponse.json({ status: 'payment', reference: order.reference, authorizationUrl: pay.authorization_url })
    } catch (e) {
      // Release the held seats straight away if we can't start payment.
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } })
      const msg = e instanceof PaymentError ? e.message : 'Payment could not be started.'
      console.error('[checkout] paystack init failed', msg)
      return NextResponse.json({ error: `${msg} Please try again shortly.` }, { status: 502 })
    }
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status })
    if (isBusyError(e)) {
      return NextResponse.json({ error: 'Lots of people are buying right now. Wait a moment and try again; you have not been charged.' }, { status: 503 })
    }
    console.error('[checkout] failed', e)
    return NextResponse.json({ error: 'Something went wrong on our side. Your card has not been charged. Try again.' }, { status: 500 })
  }
}

/** Live price check for a discount code before paying. */
export async function PUT(req: NextRequest) {
  // Limited so discount codes can't be guessed by trying a word list.
  if (!rateLimit('coupon', clientIp(req), 15, 10 * 60_000)) return NextResponse.json(tooMany(), { status: 429 })
  const b = (await req.json().catch(() => ({}))) as { eventId?: string; tierId?: string; quantity?: number; couponCode?: string }
  const tier = await prisma.ticketTier.findFirst({ where: { id: String(b.tierId ?? ''), eventId: String(b.eventId ?? '') } })
  if (!tier) return NextResponse.json({ error: 'Choose a ticket type.' }, { status: 400 })
  const subtotal = tier.price * Math.max(1, Math.floor(Number(b.quantity ?? 1)))
  try {
    const { coupon, discount } = await priceWithCoupon(prisma, b.couponCode, tier.eventId, subtotal)
    const event = await prisma.event.findUnique({ where: { id: tier.eventId }, select: { currency: true } })
    const serviceFee = processingFee(subtotal - discount, event?.currency ?? 'NGN')
    return NextResponse.json({ code: coupon?.code ?? null, discount, serviceFee, total: subtotal - discount + serviceFee })
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }
}
