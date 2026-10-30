import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CHECKIN_COOKIE, CHECKIN_PASS_MAX_AGE, signCheckinPass, verifyPin } from '@/lib/events/pin'
import { clearHits, clientIp, isLimited, recordHit } from '@/lib/rate-limit'

// Wrong PINs are limited per visitor (8 per 10 minutes) and per event (30 per 15 minutes), so
// changing IP address doesn't help someone working through every possible PIN.
const WINDOW = 10 * 60_000
const EVENT_WINDOW = 15 * 60_000

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const key = `${clientIp(req)}|${eventId}`
  if (isLimited('pin-ip', key, 8, WINDOW) || isLimited('pin-event', eventId, 30, EVENT_WINDOW)) {
    return NextResponse.json({ error: 'Too many wrong PINs. Wait 15 minutes and try again.' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as { pin?: string }
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { checkInPinHash: true } })
  if (!event?.checkInPinHash) {
    return NextResponse.json({ error: 'PIN check-in is not turned on for this event.' }, { status: 404 })
  }
  if (!(await verifyPin(String(body.pin ?? '').slice(0, 16), event.checkInPinHash))) {
    recordHit('pin-ip', key, WINDOW)
    recordHit('pin-event', eventId, EVENT_WINDOW)
    return NextResponse.json({ error: 'Wrong PIN.' }, { status: 401 })
  }
  clearHits('pin-ip', key)
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
