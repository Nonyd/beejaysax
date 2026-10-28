import type { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type Db = PrismaClient | Prisma.TransactionClient

/**
 * Tickets that occupy a seat: issued and not cancelled/refunded, plus seats held by
 * unpaid orders that have not expired yet. Counted in admissions (a table ticket can admit 10).
 */
export async function seatsTaken(db: Db, eventId: string, now = new Date()) {
  const [issued, held] = await Promise.all([
    db.ticket.findMany({
      where: { eventId, cancelledAt: null, paymentStatus: { not: 'REFUNDED' } },
      select: { tierId: true, tier: { select: { admits: true } } },
    }),
    db.order.findMany({
      where: { eventId, status: 'PENDING', expiresAt: { gt: now } },
      select: { tierId: true, quantity: true, tier: { select: { admits: true } } },
    }),
  ])

  const byTier = new Map<string, number>()
  let admissions = 0
  for (const t of issued) {
    admissions += t.tier?.admits ?? 1
    if (t.tierId) byTier.set(t.tierId, (byTier.get(t.tierId) ?? 0) + 1)
  }
  for (const o of held) {
    admissions += o.quantity * (o.tier?.admits ?? 1)
    if (o.tierId) byTier.set(o.tierId, (byTier.get(o.tierId) ?? 0) + o.quantity)
  }
  return { admissions, byTier }
}

export type TierAvailability = {
  id: string
  name: string
  description: string | null
  price: number
  admits: number
  maxPerOrder: number
  remaining: number | null
  state: 'on_sale' | 'not_started' | 'ended' | 'sold_out'
  saleStartsAt: Date | null
  saleEndsAt: Date | null
}

/** Public view of an event's tiers with what is left to buy right now. */
export async function getTierAvailability(eventId: string, now = new Date()) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { tiers: { where: { isVisible: true }, orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }] } },
  })
  if (!event) return null
  const { admissions, byTier } = await seatsTaken(prisma, eventId, now)
  const eventLeft = event.totalTickets != null ? Math.max(0, event.totalTickets - admissions) : null
  const salesClosed = now > (event.registrationDeadline ?? event.eventDate) || event.status !== 'UPCOMING'

  const tiers: TierAvailability[] = event.tiers.map((t) => {
    const tierLeft = t.capacity != null ? Math.max(0, t.capacity - (byTier.get(t.id) ?? 0)) : null
    const byEvent = eventLeft != null ? Math.floor(eventLeft / Math.max(1, t.admits)) : null
    const remaining = tierLeft == null ? byEvent : byEvent == null ? tierLeft : Math.min(tierLeft, byEvent)
    const state: TierAvailability['state'] =
      salesClosed || (t.saleEndsAt && now > t.saleEndsAt)
        ? 'ended'
        : t.saleStartsAt && now < t.saleStartsAt
          ? 'not_started'
          : remaining === 0
            ? 'sold_out'
            : 'on_sale'
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      admits: t.admits,
      maxPerOrder: t.maxPerOrder,
      remaining,
      state,
      saleStartsAt: t.saleStartsAt,
      saleEndsAt: t.saleEndsAt,
    }
  })
  return { event, tiers, eventLeft, salesClosed }
}
