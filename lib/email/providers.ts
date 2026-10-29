import { getSetting } from '@/lib/settings'

export type Provider = 'resend' | 'brevo'

export type OutgoingEmail = {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Record<string, string>
  /** Extra headers, e.g. List-Unsubscribe for mailing-list campaigns */
  headers?: Record<string, string>
}

export type ProviderResult = { ok: true; id: string } | { ok: false; error: string; retryable: boolean }

export async function senderIdentity() {
  const [name, address, replyTo] = await Promise.all([
    getSetting('email.fromName'),
    getSetting('email.fromAddress'),
    getSetting('email.replyTo'),
  ])
  // EMAIL_FROM may be "Name <addr>"; split it if so.
  const m = address?.match(/^(.+?)\s*<([^>]+)>$/)
  return { name: (m ? m[1].replace(/^["']|["']$/g, '') : name) || 'BeeJay Sax', email: m ? m[2] : address, replyTo }
}

const retryableStatus = (s: number) => s === 429 || s >= 500

async function post(url: string, headers: Record<string, string>, body: unknown, timeoutMs = 15_000) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { res, data }
}

const resendTags = (tags?: Record<string, string>) =>
  tags ? Object.entries(tags).map(([name, value]) => ({ name, value: value.replace(/[^A-Za-z0-9_-]/g, '_') })) : undefined

export async function sendViaResend(m: OutgoingEmail): Promise<ProviderResult> {
  const key = await getSetting('resend.apiKey')
  if (!key) return { ok: false, error: 'Resend is not configured', retryable: false }
  const from = await senderIdentity()
  if (!from.email) return { ok: false, error: 'No sender address configured', retryable: false }
  try {
    const { res, data } = await post(
      'https://api.resend.com/emails',
      { Authorization: `Bearer ${key}` },
      {
        from: `${from.name} <${from.email}>`,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        reply_to: m.replyTo ?? from.replyTo ?? undefined,
        tags: resendTags(m.tags),
        headers: m.headers,
      }
    )
    if (res.ok && typeof data.id === 'string') return { ok: true, id: data.id }
    return { ok: false, error: `Resend: ${String(data.message ?? res.status)}`, retryable: retryableStatus(res.status) }
  } catch (e) {
    return { ok: false, error: `Resend: ${e instanceof Error ? e.message : 'request failed'}`, retryable: true }
  }
}

export async function sendViaBrevo(m: OutgoingEmail): Promise<ProviderResult> {
  const key = await getSetting('brevo.apiKey')
  if (!key) return { ok: false, error: 'Brevo is not configured', retryable: false }
  const from = await senderIdentity()
  if (!from.email) return { ok: false, error: 'No sender address configured', retryable: false }
  try {
    const replyTo = m.replyTo ?? from.replyTo
    const { res, data } = await post(
      'https://api.brevo.com/v3/smtp/email',
      { 'api-key': key },
      {
        sender: { name: from.name, email: from.email },
        to: [{ email: m.to }],
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
        replyTo: replyTo ? { email: replyTo } : undefined,
        tags: m.tags ? Object.values(m.tags) : undefined,
        headers: m.headers,
      }
    )
    if (res.ok && typeof data.messageId === 'string') return { ok: true, id: data.messageId }
    return { ok: false, error: `Brevo: ${String(data.message ?? res.status)}`, retryable: retryableStatus(res.status) }
  } catch (e) {
    return { ok: false, error: `Brevo: ${e instanceof Error ? e.message : 'request failed'}`, retryable: true }
  }
}

export type BatchResult = { ok: true; ids: string[] } | { ok: false; error: string; retryable: boolean }

/**
 * Up to 100 emails in one Resend request (used for campaigns). All succeed or none do.
 * The idempotency key makes a repeated request within 24 hours return the original result instead of re-sending.
 */
export async function sendBatchViaResend(messages: OutgoingEmail[], idempotencyKey: string): Promise<BatchResult> {
  const key = await getSetting('resend.apiKey')
  if (!key) return { ok: false, error: 'Resend is not configured', retryable: false }
  const from = await senderIdentity()
  if (!from.email) return { ok: false, error: 'No sender address configured', retryable: false }
  try {
    const { res, data } = await post(
      'https://api.resend.com/emails/batch',
      { Authorization: `Bearer ${key}`, 'Idempotency-Key': idempotencyKey },
      messages.map((m) => ({
        from: `${from.name} <${from.email}>`,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        reply_to: m.replyTo ?? from.replyTo ?? undefined,
        tags: resendTags(m.tags),
        headers: m.headers,
      })),
      60_000
    )
    const ids = Array.isArray(data.data) ? (data.data as { id?: string }[]).map((d) => d.id ?? '') : []
    if (res.ok && ids.length === messages.length && ids.every(Boolean)) return { ok: true, ids }
    return { ok: false, error: `Resend: ${String(data.message ?? res.status)}`, retryable: retryableStatus(res.status) }
  } catch (e) {
    return { ok: false, error: `Resend: ${e instanceof Error ? e.message : 'request failed'}`, retryable: true }
  }
}

export const PROVIDERS: Record<Provider, (m: OutgoingEmail) => Promise<ProviderResult>> = {
  resend: sendViaResend,
  brevo: sendViaBrevo,
}
