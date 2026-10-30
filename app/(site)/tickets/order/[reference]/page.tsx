import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { confirmOrderPayment } from '@/lib/payments/fulfil'
import Adire from '@/components/ui/Adire'
import AutoRefresh from '@/components/tickets/AutoRefresh'
import { currencySymbol } from '@/lib/events/editor-data'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your order', robots: { index: false, follow: false } }

/** Paystack sends the buyer back here. We verify the payment server-side before showing tickets. */
export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params
  let state: string
  try {
    state = (await confirmOrderPayment(reference, { throttle: true })).state
  } catch (e) {
    console.error('[order page] verify failed', e)
    state = 'pending'
  }
  if (state === 'not_found') notFound()

  const order = await prisma.order.findUnique({
    where: { reference },
    include: { event: true, tier: true, tickets: { orderBy: { createdAt: 'asc' } } },
  })
  if (!order) notFound()
  const sym = currencySymbol(order.currency)

  return (
    <section className="relative -mt-[72px] min-h-[80vh] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.05} />
      <div className="relative mx-auto max-w-[620px] px-6 py-16 md:py-24">
        {state === 'paid' ? (
          <div className="rounded-[32px] bg-ivory p-8 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold font-display text-3xl text-night">✓</div>
            <h1 className="mt-6 font-display text-[clamp(36px,6vw,52px)] leading-[0.95]">You’re going to {order.event.title}</h1>
            <p className="mt-4 font-body text-base text-ink/70">
              {order.quantity} × {order.tier?.name ?? 'ticket'}
              {order.total > 0 ? `, ${sym}${order.total.toLocaleString()} paid` : ''}. Your tickets are on their way to{' '}
              <strong>{order.email}</strong>. You can also open them below.
            </p>
            <ul className="mt-8 space-y-3">
              {order.tickets.map((t, i) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.qrToken}`}
                    className="flex items-center justify-between rounded-[16px] border border-ink/15 bg-white/60 px-5 py-4 font-body no-underline hover:border-ink"
                  >
                    <span>
                      <span className="block font-semibold text-ink">Ticket {i + 1}</span>
                      <span className="text-sm text-ink/60">{t.ticketNumber}</span>
                    </span>
                    <span className="text-sm font-semibold text-clay-deep">Open ticket</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-body text-sm text-ink/60">Order {order.reference}</p>
          </div>
        ) : state === 'pending' ? (
          <div className="text-center text-ivory">
            <AutoRefresh seconds={5} />
            <h1 className="font-display text-[clamp(36px,6vw,52px)] leading-[0.95]">Confirming your payment</h1>
            <p className="mx-auto mt-4 max-w-[44ch] font-body text-lg text-ivory/75">
              This usually takes a few seconds. This page refreshes on its own, and your tickets will also be emailed to {order.email}.
            </p>
            <p className="mt-6 font-body text-sm text-ivory/50">Order {order.reference}</p>
          </div>
        ) : (
          <div className="text-center text-ivory">
            <h1 className="font-display text-[clamp(36px,6vw,52px)] leading-[0.95]">
              {state === 'failed' ? 'Payment didn’t go through' : state === 'closed' ? 'This order was cancelled or refunded' : 'We need to check this payment'}
            </h1>
            <p className="mx-auto mt-4 max-w-[46ch] font-body text-lg text-ivory/75">
              {state === 'failed'
                ? 'Your card was not charged. You can try again; your seats are released if you don’t.'
                : state === 'closed'
                  ? 'If you paid, the money is being returned to your card. Contact the team with your order number if you have questions.'
                  : 'Something about this payment needs a manual check. Contact the team with your order number and we’ll sort it out.'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {state === 'failed' && (
                <Link href={`/events/${order.eventId}/purchase`} className="rounded-full bg-gold px-7 py-3.5 font-body font-semibold text-night no-underline">
                  Try again
                </Link>
              )}
              <Link href="/contact" className="rounded-full border border-ivory/40 px-7 py-3.5 font-body font-semibold text-ivory no-underline">
                Contact the team
              </Link>
            </div>
            <p className="mt-6 font-body text-sm text-ivory/50">Order {order.reference}</p>
          </div>
        )}
      </div>
    </section>
  )
}
