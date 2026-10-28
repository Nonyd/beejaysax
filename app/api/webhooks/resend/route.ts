import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSetting } from '@/lib/settings'
import { safeEqual } from '@/lib/secret-box'
import { recordDeliveryEvent, type DeliveryEvent } from '@/lib/email/events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Resend signs webhooks with Svix: HMAC-SHA256 over "id.timestamp.body" using the whsec_ secret. */
function verifySvix(secret: string, id: string, ts: string, body: string, header: string) {
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 5 * 60) return false // replay window
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64')
  return header.split(' ').some((part) => {
    const [version, sig] = part.split(',')
    return version === 'v1' && !!sig && safeEqual(sig, expected)
  })
}

const MAP: Record<string, DeliveryEvent> = {
  'email.delivered': 'DELIVERED',
  'email.bounced': 'BOUNCED',
  'email.complained': 'COMPLAINED',
  'email.delivery_delayed': 'DELAYED',
}

export async function POST(req: NextRequest) {
  const secret = await getSetting('resend.webhookSecret')
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  const body = await req.text()
  const id = req.headers.get('svix-id')
  const ts = req.headers.get('svix-timestamp')
  const sig = req.headers.get('svix-signature')
  if (!id || !ts || !sig || !verifySvix(secret, id, ts, body, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const evt = JSON.parse(body) as { type?: string; data?: { email_id?: string; to?: string[]; bounce?: { message?: string } } }
  const kind = evt.type ? MAP[evt.type] : undefined
  if (kind) {
    await recordDeliveryEvent({
      provider: 'resend',
      messageId: evt.data?.email_id,
      email: evt.data?.to?.[0],
      event: kind,
      detail: evt.data?.bounce?.message ?? evt.type,
    })
  }
  return NextResponse.json({ received: true })
}
