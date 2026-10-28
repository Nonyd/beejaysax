import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CHECKIN_COOKIE, CHECKIN_PASS_MAX_AGE, signCheckinPass, verifyPin } from '@/lib/events/pin'

// Simple per-instance throttle: 8 wrong PINs per 10 minutes per IP and event.
const attempts = new Map<string, { n: number; until: number }>()

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const key = `${ip}|${eventId}`
  const now = Date.now()
  const a = attempts.get(key)
  if (a && a.until > now && a.n >= 8) {
    return NextResponse.json({ error: 'Too many wrong PINs. Wait 10 minutes and try again.' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { pin?: string }
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { checkInPinHash: true } })
  if (!event?.checkInPinHash) {
    return NextResponse.json({ error: 'PIN check-in is not turned on for this event.' }, { status: 404 })
  }
  if (!verifyPin(String(body.pin ?? ''), event.checkInPinHash)) {
    attempts.set(key, { n: (a && a.until > now ? a.n : 0) + 1, until: now + 10 * 60_000 })
    return NextResponse.json({ error: 'Wrong PIN.' }, { status: 401 })
  }
  attempts.delete(key)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CHECKIN_COOKIE, signCheckinPass(eventId, event.checkInPinHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CHECKIN_PASS_MAX_AGE,
  })
  return res
}
