import { cookies } from 'next/headers'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { can } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { CHECKIN_COOKIE, verifyCheckinPass } from '@/lib/events/pin'

/** Who is allowed to scan for this event: an admin with check-in access, or a volunteer holding a PIN pass. */
export async function checkinActor(eventId: string): Promise<{ label: string } | null> {
  const admin = await getCurrentAdmin()
  if (admin && can(admin, 'checkin')) return { label: admin.username }
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
