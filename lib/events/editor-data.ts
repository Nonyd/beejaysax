import type { Coupon, Event, TicketTier } from '@prisma/client'
import type { EditorEvent } from '@/components/admin/events/EventEditor'
import type { CouponRow } from '@/components/admin/events/CouponsPanel'

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : '')

export const BLANK_EVENT: EditorEvent = {
  title: '',
  slug: '',
  excerpt: '',
  description: '',
  venue: '',
  address: '',
  city: 'Lagos',
  country: 'Nigeria',
  eventDate: '',
  endDate: '',
  eventTime: '',
  registrationDeadline: '',
  totalTickets: '',
  posterImage: '',
  isFeatured: false,
  status: 'DRAFT',
  currency: 'NGN',
  remindersEnabled: true,
  hasPin: false,
  tiers: [],
}

/** DB event → editor state. Dates stay ISO; the editor localises them in the browser. */
export function toEditorEvent(e: Event & { tiers: (TicketTier & { _count: { tickets: number } })[] }): EditorEvent {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug ?? '',
    excerpt: e.excerpt ?? '',
    description: e.description ?? '',
    venue: e.venue,
    address: e.address ?? '',
    city: e.city,
    country: e.country,
    eventDate: iso(e.eventDate),
    endDate: iso(e.endDate),
    eventTime: e.eventTime ?? '',
    registrationDeadline: iso(e.registrationDeadline),
    totalTickets: e.totalTickets?.toString() ?? '',
    posterImage: e.posterImage ?? '',
    isFeatured: e.isFeatured,
    status: e.status,
    currency: e.currency,
    remindersEnabled: e.remindersEnabled,
    hasPin: Boolean(e.checkInPinHash),
    tiers: e.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      price: String(t.price),
      capacity: t.capacity?.toString() ?? '',
      admits: String(t.admits),
      maxPerOrder: String(t.maxPerOrder),
      saleStartsAt: iso(t.saleStartsAt),
      saleEndsAt: iso(t.saleEndsAt),
      isVisible: t.isVisible,
      sold: t._count.tickets,
    })),
  }
}

export function toCouponRows(c: Coupon[]): CouponRow[] {
  return c.map((x) => ({
    id: x.id,
    code: x.code,
    percentOff: x.percentOff,
    amountOff: x.amountOff,
    maxUses: x.maxUses,
    usedCount: x.usedCount,
    endsAt: x.endsAt?.toISOString() ?? null,
    isActive: x.isActive,
  }))
}

export function currencySymbol(c: string) {
  return c === 'NGN' ? '₦' : c === 'GBP' ? '£' : c === 'USD' ? '$' : `${c} `
}
