import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/payments/paystack'
import { confirmOrderPayment } from '@/lib/payments/fulfil'
import { getPaystackKeys } from '@/lib/settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Paystack webhook. The signature is checked against the raw body; the payment is then
 * re-verified with Paystack's API before any ticket is issued, so a forged body can't
 * mark an order paid even if a key leaked.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signedBy = await verifyWebhookSignature(raw, req.headers.get('x-paystack-signature'))
  if (!signedBy) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  let event: { event?: string; data?: { reference?: string; transaction_reference?: string; amount?: number } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  try {
    if (event.event === 'charge.success' && event.data?.reference) {
      await confirmOrderPayment(event.data.reference)
    } else if (event.event === 'refund.processed' && signedBy === (await getPaystackKeys()).mode) {
      // Refunds aren't re-checked with Paystack, so only the active mode's key may cancel tickets
      // (a test-key signature must never refund a live order).
      // Also covers refunds started from the Paystack dashboard.
      const ref = event.data?.transaction_reference
      const order = ref ? await prisma.order.findUnique({ where: { reference: ref } }) : null
      if (order && order.status === 'PAID') {
        const now = new Date()
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            // Paystack reports the refund in kobo/cents; a partial refund keeps its real amount.
            data: { status: 'REFUNDED', refundedAt: now, refundedAmount: event.data?.amount ? event.data.amount / 100 : order.total },
          }),
          prisma.ticket.updateMany({ where: { orderId: order.id }, data: { paymentStatus: 'REFUNDED', cancelledAt: now } }),
        ])
      }
    }
  } catch (e) {
    // 500 makes Paystack retry later.
    console.error('[webhook:paystack]', e)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
