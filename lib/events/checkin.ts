import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CHECKIN_COOKIE, verifyCheckinPass } from '@/lib/events/pin'

/** Who is allowed to scan for this event: a signed-in admin, or a volunteer holding a PIN pass. */
export async function checkinActor(eventId: string): Promise<{ label: string } | null> {
  const session = await auth()
  if (session?.user?.id) return { label: session.user.name ?? session.user.email ?? 'admin' }
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { checkInPinHash: true } })
  const pass = (await cookies()).get(CHECKIN_COOKIE)?.value
  return verifyCheckinPass(pass, eventId, event?.checkInPinHash ?? null) ? { label: 'Door volunteer (PIN)' } : null
}

/** Accepts a scanned ticket URL, a raw 64-char token, or a typed ticket number. */
export function parseScan(raw: string): { qrToken?: string; ticketNumber?: string } | null {
  const s = raw.trim()
  const path = s.match(/\/tickets\/([a-f0-9]{64})/i)
  if (path) return { qrToken: path[1].toLowerCase() }
  if (/^[a-f0-9]{64}$/i.test(s)) return { qrToken: s.toLowerCase() }
  if (/^BJS-\d{4}-[A-Z0-9]{4,}$/i.test(s)) return { ticketNumber: s.toUpperCase() }
  return null
}
