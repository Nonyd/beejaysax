import { NextRequest, NextResponse } from 'next/server'
import { getSetting } from '@/lib/settings'
import { safeEqual } from '@/lib/secret-box'
import { recordDeliveryEvent, type DeliveryEvent } from '@/lib/email/events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Brevo transactional webhook. Brevo doesn't sign payloads, so the URL carries a secret
 * token (?token=…) that must match the one saved in Admin → Settings.
 */
const MAP: Record<string, DeliveryEvent> = {
  delivered: 'DELIVERED',
  hard_bounce: 'BOUNCED',
  invalid_email: 'BOUNCED',
  blocked: 'BLOCKED',
  spam: 'COMPLAINED',
  complaint: 'COMPLAINED',
  deferred: 'DELAYED',
  soft_bounce: 'DELAYED',
}

export async function POST(req: NextRequest) {
  const secret = await getSetting('brevo.webhookSecret')
  const token = req.nextUrl.searchParams.get('token') ?? ''
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  if (!safeEqual(token, secret)) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as
    | { event?: string; email?: string; 'message-id'?: string; reason?: string }
    | { event?: string; email?: string; 'message-id'?: string; reason?: string }[]
    | null
  const events = Array.isArray(body) ? body : body ? [body] : []
  for (const e of events) {
    const kind = e.event ? MAP[e.event] : undefined
    if (!kind) continue
    await recordDeliveryEvent({ provider: 'brevo', messageId: e['message-id'], email: e.email, event: kind, detail: e.reason ?? e.event })
  }
  return NextResponse.json({ received: true })
}
