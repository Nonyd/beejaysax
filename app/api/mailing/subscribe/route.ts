import { NextRequest, NextResponse } from 'next/server'
import { cleanEmail, cleanName, subscribeFromWebsite } from '@/lib/mailing/contacts'
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  // Hidden field real visitors never fill in.
  if (typeof b.website === 'string' && b.website) return NextResponse.json({ ok: true })
  // A small per-IP limit so the form can't be used to flood the list.
  if (!rateLimit('subscribe', clientIp(req), 5, 10 * 60_000)) return NextResponse.json(tooMany(), { status: 429 })

  const e = cleanEmail(b.email)
  if (!e) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  try {
    await subscribeFromWebsite(e.email, cleanName(b.name))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/mailing/subscribe]', err)
    return NextResponse.json({ error: 'Couldn’t sign you up just now. Try again.' }, { status: 500 })
  }
}
