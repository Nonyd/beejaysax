import { prisma } from '@/lib/prisma'

/**
 * Deletes personal data once it is past the retention periods promised in the Privacy Policy
 * (app/(site)/privacy/page.tsx, "How long we keep it"). Keep the two in step: change a period
 * here and the policy text must change with it.
 */
export const RETENTION = {
  /** Paid and free orders and their tickets, counted from the event date (tax and accounting) */
  orderYears: 6,
  /** Checkouts that were never paid (expired, failed or cancelled with no tickets) */
  abandonedCheckoutMonths: 12,
  /** Contact form messages */
  messageYears: 2,
  /** Copies of sent emails, delivery status, reminder and campaign send records */
  emailYears: 2,
} as const

const LAST_RUN_KEY = 'status.retention.lastRun'
/** The jobs endpoint runs every 15 minutes; this only needs to happen once a day. */
const RUN_EVERY_MS = 20 * 3600_000

const yearsAgo = (n: number, now: Date) => new Date(Date.UTC(now.getUTCFullYear() - n, now.getUTCMonth(), now.getUTCDate()))
const monthsAgo = (n: number, now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, now.getUTCDate()))

export async function runRetention(now = new Date(), { force = false } = {}) {
  if (!force) {
    const last = await prisma.siteSetting.findUnique({ where: { key: LAST_RUN_KEY } })
    if (last && now.getTime() - new Date(last.value).getTime() < RUN_EVERY_MS) return { skipped: 'ran in the last 20 hours' }
  }

  const orderCutoff = yearsAgo(RETENTION.orderYears, now)
  const abandonedCutoff = monthsAgo(RETENTION.abandonedCheckoutMonths, now)
  const messageCutoff = yearsAgo(RETENTION.messageYears, now)
  const emailCutoff = yearsAgo(RETENTION.emailYears, now)

  // Orders and tickets for events more than six years ago. The event itself stays (it holds no personal data).
  const oldEvents = { event: { eventDate: { lt: orderCutoff } } }
  const tickets = await prisma.ticket.deleteMany({ where: oldEvents })
  const orders = await prisma.order.deleteMany({ where: oldEvents })

  // Unpaid checkouts: never paid, so no tickets and no financial record to keep.
  const abandoned = await prisma.order.deleteMany({
    where: {
      createdAt: { lt: abandonedCutoff },
      tickets: { none: {} },
      OR: [{ status: { in: ['EXPIRED', 'FAILED', 'CANCELLED'] } }, { status: 'PENDING', expiresAt: { lt: now } }],
    },
  })

  const messages = await prisma.contactMessage.deleteMany({ where: { createdAt: { lt: messageCutoff } } })
  const emails = await prisma.emailLog.deleteMany({ where: { createdAt: { lt: emailCutoff } } })
  const reminders = await prisma.reminderLog.deleteMany({ where: { sentAt: { lt: emailCutoff } } })
  // Campaign send records keep their status (so old campaigns still show their results) but lose the address.
  const deliveries = await prisma.campaignDelivery.updateMany({
    where: { sentAt: { lt: emailCutoff }, NOT: { email: '' } },
    data: { email: '', error: null },
  })

  // Unsubscribed people: keep only the address and the date, so they're never emailed again by mistake.
  const unsubscribed = await prisma.contact.updateMany({
    where: { status: 'UNSUBSCRIBED', OR: [{ name: { not: null } }, { NOT: { tags: { isEmpty: true } } }] },
    data: { name: null, tags: [] },
  })

  const result = {
    tickets: tickets.count,
    orders: orders.count,
    abandonedCheckouts: abandoned.count,
    messages: messages.count,
    emails: emails.count,
    reminders: reminders.count,
    campaignAddresses: deliveries.count,
    unsubscribedTrimmed: unsubscribed.count,
  }
  await prisma.siteSetting.upsert({
    where: { key: LAST_RUN_KEY },
    create: { key: LAST_RUN_KEY, value: now.toISOString() },
    update: { value: now.toISOString() },
  })
  return result
}
