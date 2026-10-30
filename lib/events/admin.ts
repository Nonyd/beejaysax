import slugify from 'slugify'
import type { EventStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPin, isValidPin } from '@/lib/events/pin'

export class ValidationError extends Error {}

export type TierInput = {
  id?: string
  name: string
  description?: string | null
  price: number
  capacity?: number | null
  admits?: number
  maxPerOrder?: number
  saleStartsAt?: string | null
  saleEndsAt?: string | null
  isVisible?: boolean
}

export type EventInput = {
  title: string
  slug?: string
  excerpt?: string | null
  description?: string | null
  venue: string
  address?: string | null
  city: string
  country?: string
  eventDate: string
  endDate?: string | null
  eventTime?: string | null
  registrationDeadline?: string | null
  totalTickets?: number | null
  posterImage?: string | null
  isFeatured?: boolean
  status?: EventStatus
  currency?: string
  remindersEnabled?: boolean
  /** New PIN to set; '' disables PIN check-in; omit to keep the current one */
  checkInPin?: string
  tiers: TierInput[]
}

const STATUSES: EventStatus[] = ['DRAFT', 'UPCOMING', 'PAST', 'CANCELLED']

function str(v: unknown, max = 5000): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s.slice(0, max) : null
}
function date(v: unknown, label: string): Date | null {
  if (v == null || v === '') return null
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${label} is not a valid date.`)
  return d
}
function int(v: unknown, label: string, min = 0): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  if (!Number.isInteger(n) || n < min) throw new ValidationError(`${label} must be a whole number of at least ${min}.`)
  return n
}

export function parseEventInput(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>
  const title = str(b.title, 200)
  const venue = str(b.venue, 200)
  const city = str(b.city, 100)
  if (!title) throw new ValidationError('Add a title.')
  if (!venue) throw new ValidationError('Add a venue.')
  if (!city) throw new ValidationError('Add a city.')
  const eventDate = date(b.eventDate, 'Start date')
  if (!eventDate) throw new ValidationError('Add a start date and time.')
  const endDate = date(b.endDate, 'End date')
  if (endDate && endDate < eventDate) throw new ValidationError('The end time is before the start time.')
  const registrationDeadline = date(b.registrationDeadline, 'Sales close date')
  const status = STATUSES.includes(b.status as EventStatus) ? (b.status as EventStatus) : 'DRAFT'

  const rawTiers = Array.isArray(b.tiers) ? b.tiers : []
  if (rawTiers.length === 0) throw new ValidationError('Add at least one ticket type.')
  const tiers = rawTiers.map((t, i) => {
    const r = (t ?? {}) as Record<string, unknown>
    const name = str(r.name, 80)
    if (!name) throw new ValidationError(`Ticket type ${i + 1} needs a name.`)
    const price = Number(r.price ?? 0)
    if (!Number.isFinite(price) || price < 0) throw new ValidationError(`${name}: price must be 0 or more.`)
    const saleStartsAt = date(r.saleStartsAt, `${name} sale start`)
    const saleEndsAt = date(r.saleEndsAt, `${name} sale end`)
    if (saleStartsAt && saleEndsAt && saleEndsAt < saleStartsAt) throw new ValidationError(`${name}: sales end before they start.`)
    return {
      id: str(r.id, 40) ?? undefined,
      name,
      description: str(r.description, 300),
      price: Math.round(price * 100) / 100,
      capacity: int(r.capacity, `${name} quantity`, 1),
      admits: int(r.admits, `${name} admits`, 1) ?? 1,
      maxPerOrder: Math.min(50, int(r.maxPerOrder, `${name} max per order`, 1) ?? 10),
      saleStartsAt,
      saleEndsAt,
      isVisible: r.isVisible !== false,
      sortOrder: i,
    }
  })

  let checkInPinHash: string | null | undefined
  if (typeof b.checkInPin === 'string') {
    const pin = b.checkInPin.trim()
    if (pin === '') checkInPinHash = null
    else if (!isValidPin(pin)) throw new ValidationError('The check-in PIN must be 6 to 8 digits.')
    else checkInPinHash = hashPin(pin)
  }

  const slugSource = str(b.slug, 120) ?? title
  return {
    data: {
      title,
      slug: slugify(slugSource, { lower: true, strict: true }).slice(0, 100) || null,
      excerpt: str(b.excerpt, 300),
      description: str(b.description, 10000),
      venue,
      address: str(b.address, 300),
      city,
      country: str(b.country, 100) ?? 'Nigeria',
      eventDate,
      endDate,
      eventTime: str(b.eventTime, 40),
      registrationDeadline,
      totalTickets: int(b.totalTickets, 'Capacity', 1),
      posterImage: str(b.posterImage, 1000),
      isFeatured: b.isFeatured === true,
      status,
      currency: str(b.currency, 3)?.toUpperCase() ?? 'NGN',
      remindersEnabled: b.remindersEnabled !== false,
      // legacy fields kept in sync for older code paths
      isFree: tiers.every((t) => t.price === 0),
      ticketPrice: Math.min(...tiers.map((t) => t.price)),
      ...(checkInPinHash !== undefined ? { checkInPinHash } : {}),
    },
    tiers,
  }
}

async function uniqueSlug(base: string | null, excludeId?: string) {
  if (!base) return null
  let slug = base
  for (let n = 2; ; n++) {
    const clash = await prisma.event.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) } })
    if (!clash) return slug
    slug = `${base}-${n}`
  }
}

/** Creates or updates an event and syncs its ticket tiers in one transaction. */
export async function saveEvent(id: string | null, body: unknown) {
  const { data, tiers } = parseEventInput(body)
  data.slug = await uniqueSlug(data.slug, id ?? undefined)

  return prisma.$transaction(async (tx) => {
    const event = id ? await tx.event.update({ where: { id }, data }) : await tx.event.create({ data })
    const existing = await tx.ticketTier.findMany({
      where: { eventId: event.id },
      include: { _count: { select: { tickets: true, orders: true } } },
    })
    const keep = new Set<string>()
    for (const t of tiers) {
      const { id: tierId, ...fields } = t
      if (tierId && existing.some((e) => e.id === tierId)) {
        keep.add(tierId)
        await tx.ticketTier.update({ where: { id: tierId }, data: fields })
      } else {
        await tx.ticketTier.create({ data: { ...fields, eventId: event.id } })
      }
    }
    for (const e of existing) {
      if (keep.has(e.id)) continue
      // Tiers with sales are hidden, never deleted, so order history stays intact.
      if (e._count.tickets + e._count.orders > 0) await tx.ticketTier.update({ where: { id: e.id }, data: { isVisible: false } })
      else await tx.ticketTier.delete({ where: { id: e.id } })
    }
    return event
  })
}

/** Copies an event and its ticket types as a new draft. */
export async function duplicateEvent(id: string) {
  const src = await prisma.event.findUnique({ where: { id }, include: { tiers: { orderBy: { sortOrder: 'asc' } } } })
  if (!src) return null
  const slug = await uniqueSlug(src.slug ? `${src.slug}-copy` : null)
  return prisma.event.create({
    data: {
      title: `${src.title} (copy)`,
      slug,
      excerpt: src.excerpt,
      description: src.description,
      venue: src.venue,
      address: src.address,
      city: src.city,
      country: src.country,
      eventDate: src.eventDate,
      endDate: src.endDate,
      eventTime: src.eventTime,
      currency: src.currency,
      ticketPrice: src.ticketPrice,
      isFree: src.isFree,
      totalTickets: src.totalTickets,
      posterImage: src.posterImage,
      remindersEnabled: src.remindersEnabled,
      status: 'DRAFT',
      tiers: {
        create: src.tiers.map((t) => ({
          name: t.name,
          description: t.description,
          price: t.price,
          capacity: t.capacity,
          admits: t.admits,
          maxPerOrder: t.maxPerOrder,
          isVisible: t.isVisible,
          sortOrder: t.sortOrder,
        })),
      },
    },
  })
}
