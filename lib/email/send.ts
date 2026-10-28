import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { PROVIDERS, type OutgoingEmail, type Provider } from '@/lib/email/providers'

export type EmailKind = 'TICKET' | 'REMINDER' | 'BROADCAST' | 'CONTACT' | 'ADMIN' | 'TEST'

export type SendResult =
  | { ok: true; provider: Provider; id: string; logId: string }
  | { ok: false; error: string; logId: string; suppressed?: boolean }

const MAX_ATTEMPTS = 5
/** Minutes before retry n (1-based): 5, 15, 60, 180 */
const BACKOFF = [5, 15, 60, 180]

async function providerOrder(): Promise<Provider[]> {
  const primary = (await getSetting('email.primary')) === 'brevo' ? 'brevo' : 'resend'
  return primary === 'resend' ? ['resend', 'brevo'] : ['brevo', 'resend']
}

/** Try the primary provider, then the other. Returns the first success or the combined error. */
async function deliver(m: OutgoingEmail) {
  const errors: string[] = []
  let retryable = false
  for (const p of await providerOrder()) {
    const r = await PROVIDERS[p](m)
    if (r.ok) return { ok: true as const, provider: p, id: r.id, fellBack: errors.length > 0, errors }
    errors.push(r.error)
    retryable ||= r.retryable
  }
  return { ok: false as const, error: errors.join(' | '), retryable }
}

/**
 * Sends one email with automatic provider fallback, and records it in EmailLog.
 * If both providers fail with a temporary error, the message is kept and retried by the jobs endpoint.
 */
export async function sendEmail(
  m: OutgoingEmail & { kind: EmailKind; related?: { type: string; id: string } }
): Promise<SendResult> {
  const to = m.to.trim().toLowerCase()
  const base = {
    to,
    subject: m.subject,
    kind: m.kind,
    replyTo: m.replyTo,
    relatedType: m.related?.type,
    relatedId: m.related?.id,
  }

  const suppressed = await prisma.emailSuppression.findUnique({ where: { email: to } })
  if (suppressed && m.kind !== 'TEST') {
    const log = await prisma.emailLog.create({
      data: { ...base, status: 'SUPPRESSED', error: `Not sent: address ${suppressed.reason.toLowerCase()} earlier` },
    })
    return { ok: false, error: `${to} previously ${suppressed.reason.toLowerCase()}, so it was not emailed`, logId: log.id, suppressed: true }
  }

  const r = await deliver({ ...m, to, tags: { kind: m.kind.toLowerCase(), ...m.tags } })
  if (r.ok) {
    const log = await prisma.emailLog.create({
      data: {
        ...base,
        status: 'SENT',
        provider: r.provider,
        providerMessageId: r.id,
        attempts: 1,
        error: r.fellBack ? `Fell back after: ${r.errors.join(' | ')}` : null,
      },
    })
    return { ok: true, provider: r.provider, id: r.id, logId: log.id }
  }

  const log = await prisma.emailLog.create({
    data: {
      ...base,
      status: r.retryable ? 'QUEUED' : 'FAILED',
      error: r.error,
      attempts: 1,
      nextAttemptAt: r.retryable ? new Date(Date.now() + BACKOFF[0] * 60_000) : null,
      html: m.html,
      text: m.text,
    },
  })
  return { ok: false, error: r.error, logId: log.id }
}

/** Retries queued emails whose wait has passed. Called by the jobs endpoint. */
export async function retryQueuedEmails(limit = 25) {
  const due = await prisma.emailLog.findMany({
    where: { status: 'QUEUED', nextAttemptAt: { lte: new Date() }, html: { not: null } },
    orderBy: { nextAttemptAt: 'asc' },
    take: limit,
  })
  let sent = 0
  for (const log of due) {
    const r = await deliver({ to: log.to, subject: log.subject, html: log.html!, text: log.text ?? undefined, replyTo: log.replyTo ?? undefined })
    const attempts = log.attempts + 1
    if (r.ok) {
      sent++
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'SENT', provider: r.provider, providerMessageId: r.id, attempts, error: null, nextAttemptAt: null, html: null, text: null },
      })
      await afterRetrySuccess(log.relatedType, log.relatedId)
    } else {
      const giveUp = !r.retryable || attempts >= MAX_ATTEMPTS
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: giveUp ? 'FAILED' : 'QUEUED',
          attempts,
          error: r.error,
          nextAttemptAt: giveUp ? null : new Date(Date.now() + BACKOFF[Math.min(attempts - 1, BACKOFF.length - 1)] * 60_000),
        },
      })
    }
  }
  return { due: due.length, sent }
}

/** Manual retry from the admin email log (any failed/queued message that still has its body). */
export async function retryEmailNow(logId: string) {
  const log = await prisma.emailLog.findUnique({ where: { id: logId } })
  if (!log?.html) return { ok: false, error: 'This email can’t be retried (its content was not kept).' }
  await prisma.emailLog.update({ where: { id: logId }, data: { status: 'QUEUED', nextAttemptAt: new Date(0) } })
  await retryQueuedEmails(1)
  const after = await prisma.emailLog.findUnique({ where: { id: logId } })
  return after?.status === 'SENT' ? { ok: true } : { ok: false, error: after?.error ?? 'Still failing' }
}

/** Keeps the ticket's delivery badge in step when a queued ticket email finally goes out. */
async function afterRetrySuccess(type: string | null, id: string | null) {
  if (type === 'ticketEmail' && id) {
    const ids = id.split(',')
    await prisma.ticket.updateMany({ where: { id: { in: ids } }, data: { emailStatus: 'SENT', emailedAt: new Date(), emailError: null } })
  }
}
