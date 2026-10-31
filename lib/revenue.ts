import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { currencySymbol } from '@/lib/events/editor-data'

/**
 * Ticket revenue, worked out from orders only: a ticket made outside checkout (an old test, say)
 * has no order and never counts as money. Live and test Paystack payments are kept apart, and
 * every figure is per currency, so naira and pound sales are never added together.
 */

export type RevenueMode = 'live' | 'test'

export type RevenueFilter = {
  mode: RevenueMode
  eventId?: string
  /** Inclusive, by payment date */
  from?: Date
  /** Exclusive, by payment date */
  to?: Date
}

/** Orders that took money: paid ones, and refunded ones (paid first, then returned). */
const TOOK_MONEY = ['PAID', 'REFUNDED'] as const

export function revenueWhere(f: RevenueFilter): Prisma.OrderWhereInput {
  return {
    status: { in: [...TOOK_MONEY] },
    // Orders from before the mode was recorded count as test, so they can't inflate live revenue.
    paymentMode: f.mode === 'live' ? 'live' : { not: 'live' },
    ...(f.eventId ? { eventId: f.eventId } : {}),
    ...(f.from || f.to ? { paidAt: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lt: f.to } : {}) } } : {}),
  }
}

export type Totals = {
  currency: string
  orders: number
  ticketsSold: number
  /** Ticket price × quantity, before discounts */
  gross: number
  discounts: number
  /** Processing fees buyers paid on top of the ticket price (they cover Paystack's fees) */
  serviceFees: number
  /** What buyers paid */
  collected: number
  fees: number
  refunds: number
  /** Collected, less Paystack fees and refunds */
  net: number
}

const emptyTotals = (currency: string): Totals => ({
  currency,
  orders: 0,
  ticketsSold: 0,
  gross: 0,
  discounts: 0,
  serviceFees: 0,
  collected: 0,
  fees: 0,
  refunds: 0,
  net: 0,
})

type MoneyOrder = {
  status: string
  currency: string
  quantity: number
  subtotal: number
  discount: number
  serviceFee: number
  total: number
  gatewayFee: number | null
  refundedAmount: number | null
}

const round = (n: number) => Math.round(n * 100) / 100

function add(t: Totals, o: MoneyOrder) {
  const refunded = o.status === 'REFUNDED' ? (o.refundedAmount ?? o.total) : 0
  t.orders += 1
  // A partly refunded order still holds its tickets; a full refund cancels them.
  if (o.status === 'PAID' || refunded < o.total) t.ticketsSold += o.quantity
  t.gross += o.subtotal
  t.discounts += o.discount
  t.serviceFees += o.serviceFee
  t.collected += o.total
  t.fees += o.gatewayFee ?? 0
  t.refunds += refunded
  t.net = round(t.collected - t.fees - t.refunds)
}

function totalsByCurrency<T extends MoneyOrder>(orders: T[]) {
  const map = new Map<string, Totals>()
  for (const o of orders) {
    const t = map.get(o.currency) ?? emptyTotals(o.currency)
    add(t, o)
    map.set(o.currency, t)
  }
  return [...map.values()].map((t) => ({ ...t, gross: round(t.gross), discounts: round(t.discounts), serviceFees: round(t.serviceFees), collected: round(t.collected), fees: round(t.fees), refunds: round(t.refunds) }))
}

export const money = (amount: number, currency: string) =>
  `${amount < 0 ? '−' : ''}${currencySymbol(currency)}${Math.abs(amount).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`

/** Everything the Revenue page shows for one filter. */
export async function getRevenueReport(f: RevenueFilter) {
  const where = revenueWhere(f)
  const createdRange = f.from || f.to ? { createdAt: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lt: f.to } : {}) } } : {}

  const [orders, freeOrders, pending, orphanTickets] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        status: true,
        currency: true,
        quantity: true,
        subtotal: true,
        discount: true,
        serviceFee: true,
        total: true,
        gatewayFee: true,
        refundedAmount: true,
        paidAt: true,
        eventId: true,
        tierId: true,
        event: { select: { title: true, eventDate: true } },
        tier: { select: { name: true } },
      },
      orderBy: { paidAt: 'asc' },
    }),
    // Free and complimentary tickets: no money, but worth seeing next to sales.
    prisma.order.groupBy({
      by: ['source'],
      where: { status: 'FREE', ...(f.eventId ? { eventId: f.eventId } : {}), ...createdRange },
      _sum: { quantity: true },
    }),
    prisma.order.count({ where: { status: 'PENDING', expiresAt: { gt: new Date() }, ...(f.eventId ? { eventId: f.eventId } : {}) } }),
    prisma.ticket.count({ where: { orderId: null, cancelledAt: null, ...(f.eventId ? { eventId: f.eventId } : {}) } }),
  ])

  const byEvent = new Map<string, { eventId: string; title: string; eventDate: Date; orders: typeof orders }>()
  for (const o of orders) {
    const e = byEvent.get(o.eventId) ?? { eventId: o.eventId, title: o.event.title, eventDate: o.event.eventDate, orders: [] }
    e.orders.push(o)
    byEvent.set(o.eventId, e)
  }

  const byTier = new Map<string, { name: string; orders: typeof orders }>()
  if (f.eventId) {
    for (const o of orders) {
      const key = o.tierId ?? 'none'
      const t = byTier.get(key) ?? { name: o.tier?.name ?? 'Ticket', orders: [] }
      t.orders.push(o)
      byTier.set(key, t)
    }
  }

  const freeBySource = Object.fromEntries(freeOrders.map((g) => [g.source, g._sum.quantity ?? 0]))

  return {
    totals: totalsByCurrency(orders),
    events: [...byEvent.values()]
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
      .map((e) => ({ eventId: e.eventId, title: e.title, eventDate: e.eventDate, totals: totalsByCurrency(e.orders) })),
    tiers: [...byTier.values()].map((t) => ({ name: t.name, totals: totalsByCurrency(t.orders) })),
    timeline: timeline(orders),
    freeTickets: freeBySource.PUBLIC ?? 0,
    compTickets: (freeBySource.COMPLIMENTARY ?? 0) + (freeBySource.ADMIN ?? 0),
    pendingCheckouts: pending,
    orphanTickets,
  }
}

/** Money collected per day (short ranges) or per month, in the main currency. */
function timeline(orders: { paidAt: Date | null; total: number; currency: string }[]) {
  const dated = orders.filter((o): o is typeof o & { paidAt: Date } => o.paidAt != null).sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime())
  if (!dated.length) return { unit: 'day' as const, currency: 'NGN', points: [] as { label: string; key: string; value: number }[] }
  const counts = new Map<string, number>()
  for (const o of dated) counts.set(o.currency, (counts.get(o.currency) ?? 0) + 1)
  const currency = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  const first = dated[0].paidAt
  const last = dated[dated.length - 1].paidAt
  const days = (last.getTime() - first.getTime()) / 86_400_000
  const unit = days <= 62 ? ('day' as const) : ('month' as const)

  const keyOf = (d: Date) => (unit === 'day' ? d.toISOString().slice(0, 10) : d.toISOString().slice(0, 7))
  const sums = new Map<string, number>()
  for (const o of dated) if (o.currency === currency) sums.set(keyOf(o.paidAt), (sums.get(keyOf(o.paidAt)) ?? 0) + o.total)

  // Fill the gaps so quiet days/months show as empty bars.
  const points: { label: string; key: string; value: number }[] = []
  const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), unit === 'day' ? first.getUTCDate() : 1))
  while (cursor <= last) {
    const key = keyOf(cursor)
    points.push({
      key,
      label: cursor.toLocaleDateString('en-GB', unit === 'day' ? { day: 'numeric', month: 'short' } : { month: 'short', year: 'numeric' }),
      value: round(sums.get(key) ?? 0),
    })
    if (unit === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return { unit, currency, points }
}

/** One page of the transactions behind the figures. */
export async function getRevenueTransactions(f: RevenueFilter, page = 1, perPage = 50) {
  const where = revenueWhere(f)
  const [rows, count] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { event: { select: { title: true } }, tier: { select: { name: true } }, coupon: { select: { code: true } } },
    }),
    prisma.order.count({ where }),
  ])
  return { rows, count, pages: Math.max(1, Math.ceil(count / perPage)) }
}

/** Reads the Revenue page's query string (also used by the CSV export). */
export function parseRevenueFilter(p: { mode?: string | null; event?: string | null; from?: string | null; to?: string | null }): RevenueFilter {
  const day = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : undefined)
  const to = day(p.to)
  if (to) to.setUTCDate(to.getUTCDate() + 1) // the "to" day is included
  return {
    mode: p.mode === 'test' ? 'test' : 'live',
    eventId: p.event || undefined,
    from: day(p.from),
    to,
  }
}
