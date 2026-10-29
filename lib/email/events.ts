import { prisma } from '@/lib/prisma'
import { markContactUndeliverable } from '@/lib/mailing/contacts'

export type DeliveryEvent = 'DELIVERED' | 'BOUNCED' | 'COMPLAINED' | 'DELAYED' | 'BLOCKED'

/**
 * Applies a delivery event from a provider webhook to the matching EmailLog row.
 * Hard bounces and spam complaints add the address to the suppression list.
 */
export async function recordDeliveryEvent(args: { provider: 'resend' | 'brevo'; messageId: string | undefined; email?: string; event: DeliveryEvent; detail?: string }) {
  const log = args.messageId
    ? await prisma.emailLog.findFirst({ where: { providerMessageId: args.messageId }, orderBy: { createdAt: 'desc' } })
    : null

  // Delivery status only moves forward: a late "delivered" never hides a bounce.
  const rank: Record<string, number> = { SENT: 1, DELIVERED: 2, BOUNCED: 3, COMPLAINED: 3, FAILED: 3 }
  const next = args.event === 'DELIVERED' ? 'DELIVERED' : args.event === 'COMPLAINED' ? 'COMPLAINED' : args.event === 'DELAYED' ? null : 'BOUNCED'
  if (log && next && (rank[next] ?? 0) >= (rank[log.status] ?? 0)) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: next, lastEventAt: new Date(), error: next === 'DELIVERED' ? log.error : (args.detail ?? next).slice(0, 500) },
    })
    if (log.relatedType === 'ticketEmail' && log.relatedId && next !== 'DELIVERED') {
      await prisma.ticket.updateMany({
        where: { id: { in: log.relatedId.split(',') } },
        data: { emailStatus: 'FAILED', emailError: `${next === 'COMPLAINED' ? 'Marked as spam' : 'Bounced'}: ${args.detail ?? ''}`.slice(0, 500) },
      })
    }
  }

  // Campaign emails are tracked per recipient in CampaignDelivery rather than EmailLog.
  let campaignTo: string | undefined
  if (!log && args.messageId && next) {
    const d = await prisma.campaignDelivery.findFirst({ where: { providerMessageId: args.messageId } })
    if (d && (rank[next] ?? 0) >= (rank[d.status] ?? 0)) {
      await prisma.campaignDelivery.update({
        where: { id: d.id },
        data: { status: next, error: next === 'DELIVERED' ? d.error : (args.detail ?? next).slice(0, 500) },
      })
    }
    campaignTo = d?.email
  }

  const email = (args.email ?? log?.to ?? campaignTo)?.toLowerCase()
  if (email && (args.event === 'BOUNCED' || args.event === 'COMPLAINED' || args.event === 'BLOCKED')) {
    const reason = args.event === 'COMPLAINED' ? 'MARKED AS SPAM' : 'BOUNCED'
    await prisma.emailSuppression.upsert({
      where: { email },
      create: { email, reason, provider: args.provider },
      update: { reason, provider: args.provider },
    })
    await markContactUndeliverable(email, args.event === 'COMPLAINED' ? 'COMPLAINED' : 'BOUNCED')
  }
}
