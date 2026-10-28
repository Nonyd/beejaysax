import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { reminderEmail, type ReminderKind } from '@/lib/email/templates'
import { dayKey, hourIn } from '@/lib/time'

const HOUR = 3600_000

/** Which reminder (if any) is due for an event right now. */
export function dueReminder(start: Date, now = new Date()): ReminderKind | null {
  const t = start.getTime() - now.getTime()
  if (t <= HOUR) return null
  const sameDay = dayKey(now) === dayKey(start)
  if (sameDay) return hourIn(now) >= 7 ? 'MORNING' : null
  // "See you tomorrow" only makes sense on the calendar day before (venue time).
  if (t <= 24 * HOUR) return 'DAY'
  if (t <= 7 * 24 * HOUR && t > 6 * 24 * HOUR) return 'WEEK'
  return null
}

/**
 * Sends due reminders. Each (event, email, kind) is claimed in ReminderLog before sending,
 * so a reminder goes out once even if two job runs overlap.
 */
export async function sendDueReminders(limit = 200, now = new Date()) {
  const events = await prisma.event.findMany({
    where: { status: 'UPCOMING', remindersEnabled: true, eventDate: { gt: now, lt: new Date(now.getTime() + 8 * 24 * HOUR) } },
  })
  let sent = 0
  let skipped = 0
  for (const event of events) {
    const kind = dueReminder(event.eventDate, now)
    if (!kind) continue
    const tickets = await prisma.ticket.findMany({
      where: { eventId: event.id, cancelledAt: null, paymentStatus: { not: 'REFUNDED' } },
      orderBy: { createdAt: 'asc' },
    })
    const byEmail = new Map<string, typeof tickets>()
    for (const t of tickets) byEmail.set(t.email, [...(byEmail.get(t.email) ?? []), t])
    const done = new Set(
      (await prisma.reminderLog.findMany({ where: { eventId: event.id, kind }, select: { email: true } })).map((r) => r.email)
    )

    for (const [email, group] of byEmail) {
      if (sent >= limit) return { sent, skipped, more: true }
      if (done.has(email)) continue
      // Just bought? They have their ticket email already; don't follow up minutes later.
      if (now.getTime() - group[0].createdAt.getTime() < 6 * HOUR) {
        skipped++
        continue
      }
      try {
        await prisma.reminderLog.create({ data: { eventId: event.id, email, kind } })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue // another run claimed it
        throw e
      }
      const msg = reminderEmail({
        firstName: group[0].firstName,
        kind,
        event,
        tickets: group.map((t) => ({ ticketNumber: t.ticketNumber, qrToken: t.qrToken, tierName: t.tierName, holder: `${t.firstName} ${t.lastName}` })),
      })
      await sendEmail({ to: email, ...msg, kind: 'REMINDER', related: { type: 'event', id: event.id } })
      sent++
    }
  }
  return { sent, skipped, more: false }
}

/** Events whose end (or start + 6h) has passed move to PAST automatically. */
export async function markPastEvents(now = new Date()) {
  const r = await prisma.event.updateMany({
    where: {
      status: 'UPCOMING',
      OR: [{ endDate: { lt: now } }, { endDate: null, eventDate: { lt: new Date(now.getTime() - 6 * HOUR) } }],
    },
    data: { status: 'PAST' },
  })
  return r.count
}
