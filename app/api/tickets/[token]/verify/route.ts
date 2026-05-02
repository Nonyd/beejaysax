import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params

  let body: { adminKey?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const serverKey =
    process.env.ADMIN_VERIFY_KEY ?? process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY ?? ''
  if (!serverKey || body.adminKey !== serverKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: { event: true },
  })

  if (!ticket) {
    return NextResponse.json({ valid: false, error: 'Ticket not found' }, { status: 404 })
  }

  const attendee = `${ticket.firstName} ${ticket.lastName}`

  if (ticket.isUsed) {
    return NextResponse.json({
      valid: false,
      reason: 'already_used' as const,
      attendee,
      ticketType: ticket.ticketType,
      ticketNumber: ticket.ticketNumber,
      eventTitle: ticket.event.title,
      usedAt: ticket.usedAt?.toISOString(),
    })
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
      usedByAdmin: 'qr-scan',
    },
  })

  return NextResponse.json({
    valid: true as const,
    attendee,
    ticketType: ticket.ticketType,
    ticketNumber: ticket.ticketNumber,
    eventTitle: ticket.event.title,
  })
}
