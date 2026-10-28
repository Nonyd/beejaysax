import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { ticketEmail } from '@/lib/email/templates'

/**
 * Emails tickets to their holder, grouped by recipient. Every ticket-sending path
 * (purchase, payment webhook, admin resend, complimentary tickets) goes through here.
 * Each ticket records its delivery state so the admin can see who didn't get theirs.
 */
export async function sendTicketsEmail(ticketIds: string[]): Promise<{ sent: number; failed: { email: string; error: string }[] }> {
  const tickets = await prisma.ticket.findMany({
    where: { id: { in: ticketIds }, cancelledAt: null },
    include: { event: true },
    orderBy: { createdAt: 'asc' },
  })
  const groups = new Map<string, typeof tickets>()
  for (const t of tickets) {
    const k = `${t.email}|${t.eventId}`
    groups.set(k, [...(groups.get(k) ?? []), t])
  }

  let sent = 0
  const failed: { email: string; error: string }[] = []
  for (const group of groups.values()) {
    const first = group[0]
    const msg = ticketEmail({
      firstName: first.firstName,
      event: first.event,
      tickets: group.map((t) => ({
        ticketNumber: t.ticketNumber,
        qrToken: t.qrToken,
        tierName: t.tierName,
        holder: `${t.firstName} ${t.lastName}`,
      })),
    })
    const ids = group.map((t) => t.id)
    const r = await sendEmail({ to: first.email, ...msg, kind: 'TICKET', related: { type: 'ticketEmail', id: ids.join(',') } })
    await prisma.ticket.updateMany({
      where: { id: { in: ids } },
      data: r.ok
        ? { emailStatus: 'SENT', emailedAt: new Date(), emailError: null }
        : { emailStatus: 'suppressed' in r && r.suppressed ? 'SUPPRESSED' : 'FAILED', emailError: r.error.slice(0, 500) },
    })
    if (r.ok) sent += group.length
    else failed.push({ email: first.email, error: r.error })
  }
  return { sent, failed }
}
