import { createHmac } from 'crypto'
import { getPaystackKeys, getSetting } from '@/lib/settings'
import { safeEqual } from '@/lib/secret-box'

const API = 'https://api.paystack.co'

export class PaymentError extends Error {}

type PaystackResponse<T> = { status: boolean; message: string; data: T }

async function call<T>(secretKey: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  })
  const body = (await res.json().catch(() => null)) as PaystackResponse<T> | null
  if (!res.ok || !body?.status) throw new PaymentError(body?.message ?? `Paystack returned ${res.status}`)
  return body.data
}

async function activeSecret() {
  const { secretKey, mode } = await getPaystackKeys()
  if (!secretKey) throw new PaymentError(`Online payment isn’t set up yet (no Paystack ${mode} key).`)
  return { secretKey, mode }
}

/** Amounts are sent in the smallest unit (kobo / cents). */
export const toMinor = (amount: number) => Math.round(amount * 100)

export async function initializePayment(args: {
  email: string
  amount: number
  currency: string
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}) {
  const { secretKey, mode } = await activeSecret()
  const data = await call<{ authorization_url: string; access_code: string; reference: string }>(secretKey, '/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: args.email,
      amount: toMinor(args.amount),
      currency: args.currency,
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata,
    }),
  })
  return { ...data, mode }
}

export type VerifiedPayment = {
  status: 'success' | 'failed' | 'abandoned' | 'reversed' | 'ongoing' | 'pending' | string
  amount: number
  currency: string
  reference: string
  id: number
}

export async function verifyPayment(reference: string): Promise<VerifiedPayment> {
  const { secretKey } = await activeSecret()
  const d = await call<{ status: string; amount: number; currency: string; reference: string; id: number }>(
    secretKey,
    `/transaction/verify/${encodeURIComponent(reference)}`
  )
  return { status: d.status, amount: d.amount / 100, currency: d.currency, reference: d.reference, id: d.id }
}

export async function refundPayment(reference: string, amount?: number) {
  const { secretKey } = await activeSecret()
  return call<{ status: string; id: number }>(secretKey, '/refund', {
    method: 'POST',
    body: JSON.stringify({ transaction: reference, ...(amount ? { amount: toMinor(amount) } : {}) }),
  })
}

/**
 * Paystack signs webhooks with HMAC-SHA512 of the raw body using the secret key.
 * Both the test and live keys are tried, so switching modes never drops in-flight webhooks.
 * Returns the mode whose key matched (null if none), so callers can trust only the active mode.
 */
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<'test' | 'live' | null> {
  if (!signature) return null
  for (const mode of ['live', 'test'] as const) {
    const key = await getSetting(`paystack.${mode}.secretKey`)
    if (key && safeEqual(createHmac('sha512', key).update(rawBody).digest('hex'), signature)) return mode
  }
  return null
}
