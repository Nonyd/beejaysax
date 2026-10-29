import { NextRequest, NextResponse } from 'next/server'
import { cleanEmail, cleanName, subscribeFromWebsite } from '@/lib/mailing/contacts'

export const runtime = 'nodejs'

/** Small per-IP limit so the form can't be used to flood the list (resets when the app restarts). */
const hits = new Map<string, number[]>()
function allowed(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length <= 5
}

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  // Hidden field real visitors never fill in.
  if (typeof b.website === 'string' && b.website) return NextResponse.json({ ok: true })
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!allowed(ip)) return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })

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
