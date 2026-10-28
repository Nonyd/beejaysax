import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/payments/paystack'
import { confirmOrderPayment } from '@/lib/payments/fulfil'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Paystack webhook. The signature is checked against the raw body; the payment is then
 * re-verified with Paystack's API before any ticket is issued, so a forged body can't
 * mark an order paid even if a key leaked.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  if (!(await verifyWebhookSignature(raw, req.headers.get('x-paystack-signature')))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  let event: { event?: string; data?: { reference?: string; transaction_reference?: string } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  try {
    if (event.event === 'charge.success' && event.data?.reference) {
      await confirmOrderPayment(event.data.reference)
    } else if (event.event === 'refund.processed') {
      // Also covers refunds started from the Paystack dashboard.
      const ref = event.data?.transaction_reference
      const order = ref ? await prisma.order.findUnique({ where: { reference: ref } }) : null
      if (order && order.status === 'PAID') {
        const now = new Date()
        await prisma.$transaction([
          prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', refundedAt: now } }),
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
