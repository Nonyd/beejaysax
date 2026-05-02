import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export function extractQrToken(raw: string): string | null {
  const s = raw.trim()
  const fromPath = s.match(/\/tickets\/([^/?#]+)/)
  if (fromPath?.[1]) return fromPath[1]
  if (/^[a-f0-9]{64}$/i.test(s)) return s
  return null
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { raw?: string; qrToken?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = String(body.raw ?? body.qrToken ?? '')
  const qrToken = extractQrToken(raw)
  if (!qrToken) {
    return NextResponse.json({ error: 'Invalid QR payload' }, { status: 400 })
  }

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken },
    include: { event: true },
  })

  if (!ticket) {
    return NextResponse.json({ valid: false, reason: 'not_found' as const }, { status: 404 })
  }

  if (ticket.isUsed) {
    return NextResponse.json({
      valid: false,
      reason: 'already_used' as const,
      usedAt: ticket.usedAt?.toISOString() ?? null,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        name: `${ticket.firstName} ${ticket.lastName}`,
        ticketType: ticket.ticketType,
        eventTitle: ticket.event.title,
      },
    })
  }

  const adminLabel = session.user.email ?? session.user.name ?? session.user.id

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      usedByAdmin: adminLabel,
    },
  })

  return NextResponse.json({
    valid: true as const,
    ticket: {
      ticketNumber: ticket.ticketNumber,
      name: `${ticket.firstName} ${ticket.lastName}`,
      ticketType: ticket.ticketType,
      eventTitle: ticket.event.title,
    },
  })
}
