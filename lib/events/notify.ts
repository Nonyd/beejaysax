import { prisma } from '@/lib/prisma'
import { sendTicketEmail } from '@/lib/resend'
import { siteBase } from '@/lib/events/orders'

/**
 * Emails tickets to their holder, grouped by recipient. Every ticket-sending path
 * (purchase, payment webhook, admin resend, complimentary tickets) goes through here.
 */
export async function sendTicketsEmail(ticketIds: string[]): Promise<{ sent: number; failed: { email: string; error: string }[] }> {
  const tickets = await prisma.ticket.findMany({
    where: { id: { in: ticketIds }, cancelledAt: null },
    include: { event: true },
    orderBy: { createdAt: 'asc' },
  })
  const base = siteBase()
  const groups = new Map<string, typeof tickets>()
  for (const t of tickets) {
    const k = `${t.email}|${t.eventId}`
    groups.set(k, [...(groups.get(k) ?? []), t])
  }

  let sent = 0
  const failed: { email: string; error: string }[] = []
  for (const group of groups.values()) {
    const first = group[0]
    const r = await sendTicketEmail({
      to: first.email,
      attendeeFirstName: first.firstName,
      eventTitle: first.event.title,
      eventDate: first.event.eventDate,
      venue: first.event.venue,
      city: first.event.city,
      country: first.event.country,
      tickets: group.map((t) => ({ ticketNumber: t.ticketNumber, qrDataUrl: t.qrCode, viewUrl: `${base}/tickets/${t.qrToken}` })),
    })
    if (r.ok) sent += group.length
    else failed.push({ email: first.email, error: r.message })
  }
  return { sent, failed }
}
