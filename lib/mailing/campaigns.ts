import { createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { sendBatchViaResend, sendViaBrevo, type OutgoingEmail } from '@/lib/email/providers'
import { sendEmail } from '@/lib/email/send'
import { campaignEmail, type CampaignContent } from '@/lib/email/templates'
import { getSetting } from '@/lib/settings'
import { audienceWhere } from '@/lib/mailing/contacts'

const BATCH = 100
/** A claimed batch that never finished (server restart) is retried after this long. */
const STALE_CLAIM_MIN = 10

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
export const unsubscribeUrl = (token: string) => `${siteUrl()}/unsubscribe?t=${encodeURIComponent(token)}`
const oneClickUrl = (token: string) => `${siteUrl()}/api/mailing/unsubscribe?t=${encodeURIComponent(token)}`

export class CampaignError extends Error {}

function render(c: CampaignContent, to: { email: string; name: string | null; token: string }): OutgoingEmail {
  return {
    to: to.email,
    ...campaignEmail(c, { name: to.name, unsubscribeUrl: unsubscribeUrl(to.token) }),
    tags: { kind: 'campaign' },
    // Lets Gmail, Yahoo and Apple Mail show their own one-click "Unsubscribe" button.
    headers: { 'List-Unsubscribe': `<${oneClickUrl(to.token)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  }
}

/** How many people a campaign to `tag` would reach right now. */
export async function audienceSize(tag: string | null) {
  const where = audienceWhere(tag)
  const [all, blocked] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(*) AS n FROM "Contact" c JOIN "EmailSuppression" s ON s.email = c.email
      WHERE c.status = 'SUBSCRIBED' AND (${tag}::text IS NULL OR ${tag} = ANY(c.tags))`,
  ])
  return all - Number(blocked[0]?.n ?? 0)
}

/** Sends one copy to `to` (marked as a test, ignores the audience). */
export async function sendCampaignTest(c: CampaignContent, to: string) {
  const m = render(c, { email: to, name: null, token: 'test' })
  return sendEmail({ ...m, subject: `[Test] ${m.subject}`, kind: 'TEST' })
}

/**
 * Fixes the recipient list and starts sending. Only a draft can be started, and only once:
 * two admins pressing Send at the same moment still produce one send.
 */
export async function startCampaign(id: string) {
  const c = await prisma.campaign.findUnique({ where: { id } })
  if (!c) throw new CampaignError('Campaign not found.')
  if (c.status !== 'DRAFT') throw new CampaignError('This campaign was already sent.')
  if (!c.subject.trim() || !c.body.trim()) throw new CampaignError('Add a subject and a message first.')
  if (!(await getSetting('resend.apiKey')) && !(await getSetting('brevo.apiKey'))) {
    throw new CampaignError('Add a Resend or Brevo API key in Settings → Email first.')
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.campaign.updateMany({ where: { id, status: 'DRAFT' }, data: { status: 'SENDING', startedAt: new Date() } })
    if (claimed.count === 0) throw new CampaignError('This campaign was already sent.')
    const inserted = await tx.$executeRaw`
      INSERT INTO "CampaignDelivery" (id, "campaignId", "contactId", email, status)
      SELECT md5(${id} || c.id), ${id}, c.id, c.email, 'PENDING'
      FROM "Contact" c
      WHERE c.status = 'SUBSCRIBED'
        AND (${c.audienceTag}::text IS NULL OR ${c.audienceTag} = ANY(c.tags))
        AND NOT EXISTS (SELECT 1 FROM "EmailSuppression" s WHERE s.email = c.email)
      ON CONFLICT DO NOTHING`
    if (inserted === 0) throw new CampaignError('Nobody on the list matches this audience.')
    await tx.campaign.update({ where: { id }, data: { recipients: inserted } })
    return inserted
  }, { timeout: 60_000 })
}

type Claimed = { id: string; email: string; contactId: string }

async function claimBatch(campaignId: string): Promise<Claimed[]> {
  return prisma.$queryRaw<Claimed[]>`
    UPDATE "CampaignDelivery" SET status = 'SENDING', "claimedAt" = now()
    WHERE id IN (
      SELECT id FROM "CampaignDelivery"
      WHERE "campaignId" = ${campaignId}
        AND (status = 'PENDING' OR (status = 'SENDING' AND "claimedAt" < now() - make_interval(mins => ${STALE_CLAIM_MIN}::int)))
      ORDER BY id LIMIT ${BATCH}
      FOR UPDATE SKIP LOCKED)
    RETURNING id, email, "contactId"`
}

async function markSent(rows: { id: string; provider: string; messageId: string }[]) {
  if (!rows.length) return
  await prisma.$executeRaw`
    UPDATE "CampaignDelivery" d SET status = 'SENT', provider = v.provider, "providerMessageId" = v.mid, "sentAt" = now(), error = NULL
    FROM (SELECT unnest(${rows.map((r) => r.id)}::text[]) AS id, unnest(${rows.map((r) => r.provider)}::text[]) AS provider,
                 unnest(${rows.map((r) => r.messageId)}::text[]) AS mid) v
    WHERE d.id = v.id`
}

/** Sends one claimed batch: Resend in a single request, falling back to Brevo one by one. */
async function sendBatch(c: CampaignContent & { id: string }, batch: Claimed[]) {
  const contacts = await prisma.contact.findMany({ where: { id: { in: batch.map((b) => b.contactId) } }, select: { id: true, name: true, token: true, status: true } })
  const byId = new Map(contacts.map((x) => [x.id, x]))
  // Someone may have unsubscribed after the send started.
  const live = batch.filter((b) => byId.get(b.contactId)?.status === 'SUBSCRIBED')
  const gone = batch.filter((b) => !live.includes(b))
  if (gone.length) {
    await prisma.campaignDelivery.updateMany({ where: { id: { in: gone.map((g) => g.id) } }, data: { status: 'FAILED', error: 'Unsubscribed before sending' } })
  }
  if (!live.length) return

  const messages = live.map((b) => render(c, { email: b.email, name: byId.get(b.contactId)!.name, token: byId.get(b.contactId)!.token }))
  const key = createHash('sha256').update(`${c.id}:${live.map((b) => b.id).join(',')}`).digest('hex').slice(0, 48)
  const r = await sendBatchViaResend(messages, `campaign-${key}`)
  if (r.ok) {
    await markSent(live.map((b, i) => ({ id: b.id, provider: 'resend', messageId: r.ids[i] })))
    return
  }

  const sent: { id: string; provider: string; messageId: string }[] = []
  for (const [i, b] of live.entries()) {
    const one = await sendViaBrevo(messages[i])
    if (one.ok) sent.push({ id: b.id, provider: 'brevo', messageId: one.id })
    else if (one.retryable || r.retryable) {
      // Leave it for the next round (both providers busy or down).
      await prisma.campaignDelivery.update({ where: { id: b.id }, data: { status: 'PENDING', claimedAt: null, error: `${r.error} | ${one.error}`.slice(0, 500) } })
    } else {
      await prisma.campaignDelivery.update({ where: { id: b.id }, data: { status: 'FAILED', error: `${r.error} | ${one.error}`.slice(0, 500) } })
    }
  }
  await markSent(sent)
  // Nothing went through at all: stop this round rather than hammer both providers.
  if (!sent.length) throw new CampaignError(`Sending paused: ${r.error}`)
}

/**
 * Sends pending campaign emails until `budgetMs` runs out. Called by the admin page while it's open
 * and by the scheduled jobs, so a send finishes even if the admin closes the page.
 */
export async function pumpCampaigns(budgetMs = 20_000) {
  const until = Date.now() + budgetMs
  let sent = 0
  const sending = await prisma.campaign.findMany({ where: { status: 'SENDING' }, orderBy: { startedAt: 'asc' } })
  for (const c of sending) {
    while (Date.now() < until) {
      const batch = await claimBatch(c.id)
      if (!batch.length) break
      try {
        await sendBatch(c, batch)
        sent += batch.length
      } catch (e) {
        console.error('[campaigns]', e)
        return { sent, error: e instanceof Error ? e.message : String(e) }
      }
      await new Promise((r) => setTimeout(r, 600)) // stay under Resend's request rate
    }
    const left = await prisma.campaignDelivery.count({ where: { campaignId: c.id, status: { in: ['PENDING', 'SENDING'] } } })
    if (left === 0) await prisma.campaign.updateMany({ where: { id: c.id, status: 'SENDING' }, data: { status: 'SENT', finishedAt: new Date() } })
    if (Date.now() >= until) break
  }
  return { sent }
}

/** Stops a campaign that is sending; recipients not yet emailed are dropped. */
export async function cancelCampaign(id: string) {
  await prisma.$transaction([
    prisma.campaignDelivery.updateMany({ where: { campaignId: id, status: 'PENDING' }, data: { status: 'FAILED', error: 'Campaign stopped' } }),
    prisma.campaign.updateMany({ where: { id, status: 'SENDING' }, data: { status: 'CANCELLED', finishedAt: new Date() } }),
  ])
}

export type CampaignStats = { recipients: number; pending: number; sent: number; delivered: number; bounced: number; failed: number }

export async function campaignStats(id: string, recipients: number): Promise<CampaignStats> {
  const g = await prisma.campaignDelivery.groupBy({ by: ['status'], where: { campaignId: id }, _count: true })
  const n = (...s: string[]) => g.filter((x) => s.includes(x.status)).reduce((a, x) => a + x._count, 0)
  return {
    recipients,
    pending: n('PENDING', 'SENDING'),
    sent: n('SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED'),
    delivered: n('DELIVERED'),
    bounced: n('BOUNCED', 'COMPLAINED'),
    failed: n('FAILED'),
  }
}
