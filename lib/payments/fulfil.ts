import { prisma } from '@/lib/prisma'
import { markOrderPaid, OrderError } from '@/lib/events/orders'
import { sendTicketsEmail } from '@/lib/events/notify'
import { PaymentError, refundPayment, verifyPayment } from '@/lib/payments/paystack'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Confirms an order with Paystack and issues tickets. Called from both the browser return
 * page and the webhook; whichever arrives first does the work, the other is a no-op.
 * Tickets are emailed only by the caller that actually issued them.
 * `throttle` (the order page, which refreshes itself) asks Paystack at most once every few seconds per order.
 */
export async function confirmOrderPayment(reference: string, opts: { throttle?: boolean } = {}) {
  const order = await prisma.order.findUnique({ where: { reference } })
  if (!order) return { state: 'not_found' as const }
  if (order.status === 'PAID' || order.status === 'FREE') return { state: 'paid' as const, order }
  if (order.status === 'REFUNDED' || order.status === 'CANCELLED') return { state: 'closed' as const, order }

  if (opts.throttle && !rateLimit('paystack-verify', reference, 1, 4_000)) return { state: 'pending' as const, order }
  const payment = await verifyPayment(reference)
  if (payment.status !== 'success') {
    if (payment.status === 'failed' || payment.status === 'reversed') {
      await prisma.order.updateMany({ where: { id: order.id, status: 'PENDING' }, data: { status: 'FAILED' } })
      return { state: 'failed' as const, order }
    }
    return { state: 'pending' as const, order }
  }
  if (payment.currency !== order.currency) {
    console.error(`[payments] currency mismatch on ${reference}: ${payment.currency} vs ${order.currency}`)
    return { state: 'mismatch' as const, order }
  }
  try {
    const r = await markOrderPaid(reference, { gateway: 'paystack', gatewayRef: String(payment.id), amountPaid: payment.amount })
    if (r.fresh) {
      const mail = await sendTicketsEmail(r.tickets.map((t) => t.id))
      if (mail.failed.length) console.error(`[payments] tickets for ${reference} issued but email failed: ${mail.failed[0].error}`)
    }
    return { state: 'paid' as const, order: r.order }
  } catch (e) {
    if (e instanceof OrderError && e.status === 409) {
      console.error(`[payments] ${e.message}`)
      return { state: 'mismatch' as const, order }
    }
    if (e instanceof OrderError && e.status === 410) {
      // Paid after the seat hold ran out and the event filled up meanwhile: give the money back
      // rather than oversell.
      console.error(`[payments] ${e.message}; refunding`)
      const refund = await refundPayment(reference)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundRef: String(refund.id),
          note: `${order.note ? `${order.note}\n` : ''}Paid after the seat hold expired and no seats were left; refunded automatically.`,
        },
      })
      return { state: 'closed' as const, order }
    }
    throw e
  }
}

/** Refunds a paid order through Paystack and cancels its tickets. */
export async function refundOrder(orderId: string, by: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new PaymentError('Order not found.')
  if (order.status !== 'PAID') throw new PaymentError(`Order ${order.reference} is not a paid order, so it can’t be refunded.`)
  const refund = await refundPayment(order.reference)
  const now = new Date()
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', refundedAt: now, refundRef: String(refund.id), note: `${order.note ? `${order.note}\n` : ''}Refunded by ${by}` },
    }),
    prisma.ticket.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'REFUNDED', cancelledAt: now } }),
  ])
  return order.reference
}
