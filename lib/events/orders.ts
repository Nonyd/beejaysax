import { randomBytes } from 'crypto'
import { Prisma, type Coupon, type Order, type Ticket } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { generateQRCodeDataURL, generateQRToken } from '@/lib/qrcode'
import { seatsTaken } from '@/lib/events/availability'
import { processingFee } from '@/lib/payments/fees'

/** Wait for a free DB connection (busy sales) and allow time for QR generation. */
const TX_OPTIONS = { maxWait: 15_000, timeout: 20_000 }

/** Turns "database too busy" errors into a message a buyer can act on. */
export function isBusyError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && ['P2028', 'P2034', 'P2024'].includes(e.code)
}

/** Unpaid checkouts hold their seats this long, then expire. */
export const HOLD_MINUTES = 15

export class OrderError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message)
  }
}

export function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
}

export function newOrderReference() {
  // The reference alone opens the order page, so it carries 96 random bits.
  return `BJS-${Date.now().toString(36).toUpperCase()}-${randomBytes(12).toString('hex').toUpperCase()}`
}

function newTicketNumber() {
  return `BJS-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export type Buyer = { firstName: string; lastName: string; email: string; phone?: string }

/** Works out the discount for a code, or explains why it can't be used. */
export async function priceWithCoupon(
  db: Prisma.TransactionClient | typeof prisma,
  code: string | undefined,
  eventId: string,
  subtotal: number,
  now = new Date()
): Promise<{ coupon: Coupon | null; discount: number }> {
  if (!code?.trim()) return { coupon: null, discount: 0 }
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  // One message for every reason, so the form can't be used to learn which codes exist.
  const invalid = () => new OrderError('That discount code can’t be used for this event.')
  if (!coupon || !coupon.isActive || (coupon.eventId && coupon.eventId !== eventId)) throw invalid()
  if ((coupon.startsAt && now < coupon.startsAt) || (coupon.endsAt && now > coupon.endsAt)) throw invalid()
  if (coupon.maxUses != null) {
    const used = await db.order.count({
      where: {
        couponId: coupon.id,
        OR: [{ status: { in: ['PAID', 'FREE'] } }, { status: 'PENDING', expiresAt: { gt: now } }],
      },
    })
    if (used >= coupon.maxUses) throw invalid()
  }
  const raw = coupon.percentOff ? (subtotal * coupon.percentOff) / 100 : (coupon.amountOff ?? 0)
  return { coupon, discount: Math.min(subtotal, Math.round(raw * 100) / 100) }
}

/**
 * Creates an order inside a transaction that locks the event row, so two buyers can never
 * take the last seat. Free orders (total 0) get their tickets immediately; paid orders hold
 * seats for HOLD_MINUTES until payment is confirmed.
 */
export async function createOrder(input: {
  eventId: string
  tierId: string
  quantity: number
  buyer: Buyer
  couponCode?: string
  source?: 'PUBLIC' | 'COMPLIMENTARY' | 'ADMIN'
  createdBy?: string
  note?: string
}): Promise<{ order: Order; tickets: Ticket[] }> {
  const now = new Date()
  const source = input.source ?? 'PUBLIC'
  const isPublic = source === 'PUBLIC'

  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${input.eventId} FOR UPDATE`
      const event = await tx.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new OrderError('Event not found.', 404)
      const tier = await tx.ticketTier.findFirst({ where: { id: input.tierId, eventId: event.id } })
      if (!tier) throw new OrderError('Choose a ticket type.')

      if (isPublic) {
        if (event.status !== 'UPCOMING') throw new OrderError('Tickets for this event are not on sale.')
        if (now > (event.registrationDeadline ?? event.eventDate)) throw new OrderError('Ticket sales for this event have closed.')
        if (!tier.isVisible) throw new OrderError('That ticket type is not available.')
        if (tier.saleStartsAt && now < tier.saleStartsAt) throw new OrderError(`${tier.name} tickets are not on sale yet.`)
        if (tier.saleEndsAt && now > tier.saleEndsAt) throw new OrderError(`${tier.name} ticket sales have ended.`)
        if (input.quantity < 1 || input.quantity > tier.maxPerOrder) {
          throw new OrderError(`You can buy between 1 and ${tier.maxPerOrder} ${tier.name} tickets per order.`)
        }
      }

      const { admissions, byTier } = await seatsTaken(tx, event.id, now)
      if (tier.capacity != null && (byTier.get(tier.id) ?? 0) + input.quantity > tier.capacity) {
        const left = Math.max(0, tier.capacity - (byTier.get(tier.id) ?? 0))
        throw new OrderError(left === 0 ? `${tier.name} is sold out.` : `Only ${left} ${tier.name} tickets left.`)
      }
      if (event.totalTickets != null && admissions + input.quantity * tier.admits > event.totalTickets) {
        throw new OrderError('There are not enough tickets left for that quantity.')
      }

      const unitPrice = isPublic ? tier.price : 0
      const subtotal = unitPrice * input.quantity
      const { coupon, discount } = isPublic
        ? await priceWithCoupon(tx, input.couponCode, event.id, subtotal, now)
        : { coupon: null, discount: 0 }
      // The buyer pays Paystack's processing fee on top, so the full ticket price reaches us.
      const ticketsTotal = Math.max(0, subtotal - discount)
      const serviceFee = processingFee(ticketsTotal, event.currency)
      const total = ticketsTotal + serviceFee
      const free = total === 0

      const order = await tx.order.create({
        data: {
          reference: newOrderReference(),
          eventId: event.id,
          tierId: tier.id,
          firstName: input.buyer.firstName,
          lastName: input.buyer.lastName,
          email: input.buyer.email.toLowerCase(),
          phone: input.buyer.phone || null,
          quantity: input.quantity,
          unitPrice,
          subtotal,
          discount,
          serviceFee,
          total,
          currency: event.currency,
          couponId: coupon?.id,
          status: free ? 'FREE' : 'PENDING',
          source,
          paidAt: free ? now : null,
          expiresAt: free ? null : new Date(now.getTime() + HOLD_MINUTES * 60_000),
          createdBy: input.createdBy,
          note: input.note,
        },
      })

      const tickets = free ? await issueTicketsTx(tx, order.id) : []
      if (free && coupon) await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      return { order, tickets }
    },
    TX_OPTIONS
  )
}

/** Creates the order's tickets if they don't exist yet. Safe to call more than once. */
async function issueTicketsTx(tx: Prisma.TransactionClient, orderId: string): Promise<Ticket[]> {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { tier: true, tickets: true } })
  if (order.tickets.length > 0) return order.tickets
  const base = siteBase()
  // Each ticket carries its share of the ticket price; the processing fee isn't part of it.
  const perTicket = order.quantity > 0 ? (order.total - order.serviceFee) / order.quantity : 0
  const created: Ticket[] = []
  for (let i = 0; i < order.quantity; i++) {
    const qrToken = generateQRToken()
    created.push(
      await tx.ticket.create({
        data: {
          ticketNumber: newTicketNumber(),
          eventId: order.eventId,
          orderId: order.id,
          tierId: order.tierId,
          tierName: order.tier?.name ?? 'General admission',
          firstName: order.firstName,
          lastName: order.lastName,
          email: order.email,
          phone: order.phone,
          ticketType: order.total === 0 ? 'FREE' : 'GENERAL',
          quantity: 1,
          totalAmount: Math.round(perTicket * 100) / 100,
          qrToken,
          qrCode: await generateQRCodeDataURL(qrToken, base),
          paymentStatus: order.total === 0 ? 'FREE' : 'PAID',
          paymentRef: order.reference,
        },
      })
    )
  }
  return created
}

/**
 * Marks a pending order paid and issues its tickets, exactly once even if the webhook and
 * the browser redirect arrive together. Returns null if the order was already handled.
 */
export async function markOrderPaid(
  reference: string,
  args: { gateway: string; gatewayRef: string; amountPaid: number; mode?: 'live' | 'test'; fee?: number | null }
) {
  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({ where: { reference } })
      if (!order) throw new OrderError('Order not found.', 404)
      if (order.status === 'PAID') return { order, tickets: await tx.ticket.findMany({ where: { orderId: order.id } }), fresh: false }
      if (Math.abs(args.amountPaid - order.total) > 0.01) {
        throw new OrderError(`Amount mismatch for ${reference}: paid ${args.amountPaid}, expected ${order.total}`, 409)
      }
      // A payment that lands after the hold ran out: its seats may have gone to someone else since,
      // so check again under the event lock before issuing anything.
      const now = new Date()
      const lapsed = order.status !== 'PENDING' || (order.expiresAt != null && order.expiresAt < now)
      if (lapsed && !(await stillFits(tx, order, now))) {
        throw new OrderError(`No seats left for late payment on ${reference}`, 410)
      }
      // Claim the order atomically: only one caller moves it to PAID.
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: { in: ['PENDING', 'EXPIRED', 'FAILED'] } },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          gateway: args.gateway,
          gatewayRef: args.gatewayRef,
          expiresAt: null,
          ...(args.mode ? { paymentMode: args.mode } : {}),
          ...(args.fee != null ? { gatewayFee: args.fee } : {}),
        },
      })
      if (claimed.count === 0) return { order, tickets: await tx.ticket.findMany({ where: { orderId: order.id } }), fresh: false }
      if (order.couponId) await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } })
      const tickets = await issueTicketsTx(tx, order.id)
      return { order: { ...order, status: 'PAID' as const }, tickets, fresh: true }
    },
    TX_OPTIONS
  )
}

/** Whether a lapsed order's seats and discount code are still free (call inside a transaction). */
async function stillFits(tx: Prisma.TransactionClient, order: Order, now: Date) {
  await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${order.eventId} FOR UPDATE`
  const [event, tier] = await Promise.all([
    tx.event.findUnique({ where: { id: order.eventId } }),
    order.tierId ? tx.ticketTier.findUnique({ where: { id: order.tierId } }) : null,
  ])
  if (!event) return false
  const { admissions, byTier } = await seatsTaken(tx, event.id, now)
  if (tier?.capacity != null && (byTier.get(tier.id) ?? 0) + order.quantity > tier.capacity) return false
  if (event.totalTickets != null && admissions + order.quantity * (tier?.admits ?? 1) > event.totalTickets) return false
  if (order.couponId) {
    const coupon = await tx.coupon.findUnique({ where: { id: order.couponId } })
    if (coupon?.maxUses != null) {
      const used = await tx.order.count({
        where: { couponId: coupon.id, id: { not: order.id }, OR: [{ status: { in: ['PAID', 'FREE'] } }, { status: 'PENDING', expiresAt: { gt: now } }] },
      })
      if (used >= coupon.maxUses) return false
    }
  }
  return true
}

/** Releases seats held by checkouts that were never paid. */
export async function expireStaleOrders(now = new Date()) {
  const r = await prisma.order.updateMany({ where: { status: 'PENDING', expiresAt: { lt: now } }, data: { status: 'EXPIRED' } })
  return r.count
}
