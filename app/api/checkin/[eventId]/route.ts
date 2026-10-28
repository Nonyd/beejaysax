import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkinActor, parseScan } from '@/lib/events/checkin'

type Params = { params: Promise<{ eventId: string }> }

async function stats(eventId: string) {
  const [total, admitted] = await Promise.all([
    prisma.ticket.count({ where: { eventId, cancelledAt: null, paymentStatus: { not: 'REFUNDED' } } }),
    prisma.ticket.count({ where: { eventId, isUsed: true, cancelledAt: null } }),
  ])
  return { total, admitted }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { eventId } = await params
  if (!(await checkinActor(eventId))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return NextResponse.json({ stats: await stats(eventId) })
}

/** Scan a ticket at the door. Admits it exactly once. */
export async function POST(req: NextRequest, { params }: Params) {
  const { eventId } = await params
  const actor = await checkinActor(eventId)
  if (!actor) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { raw?: string }
  const parsed = parseScan(String(body.raw ?? ''))
  if (!parsed) return NextResponse.json({ result: 'invalid', message: 'That is not a BeeJay Sax ticket code.' })

  const ticket = await prisma.ticket.findFirst({
    where: parsed.qrToken ? { qrToken: parsed.qrToken } : { ticketNumber: parsed.ticketNumber },
    include: { event: { select: { id: true, title: true } }, order: { select: { status: true } } },
  })
  if (!ticket) return NextResponse.json({ result: 'not_found', message: 'No ticket matches this code.' })

  const holder = {
    name: `${ticket.firstName} ${ticket.lastName}`,
    ticketNumber: ticket.ticketNumber,
    tier: ticket.tierName ?? ticket.ticketType,
  }
  if (ticket.eventId !== eventId) {
    return NextResponse.json({ result: 'wrong_event', message: `This ticket is for ${ticket.event.title}.`, holder })
  }
  if (ticket.cancelledAt || ticket.paymentStatus === 'REFUNDED' || ticket.order?.status === 'REFUNDED') {
    return NextResponse.json({ result: 'cancelled', message: 'This ticket was cancelled or refunded.', holder })
  }

  // Conditional update: only one scan can flip isUsed, even if two volunteers scan at once.
  const claimed = await prisma.ticket.updateMany({
    where: { id: ticket.id, isUsed: false },
    data: { isUsed: true, usedAt: new Date(), usedByAdmin: actor.label },
  })
  if (claimed.count === 0) {
    const fresh = await prisma.ticket.findUnique({ where: { id: ticket.id }, select: { usedAt: true, usedByAdmin: true } })
    return NextResponse.json({
      result: 'already_used',
      message: 'Already checked in.',
      usedAt: fresh?.usedAt?.toISOString() ?? null,
      usedBy: fresh?.usedByAdmin ?? null,
      holder,
    })
  }
  return NextResponse.json({ result: 'admitted', message: 'Admitted', holder, stats: await stats(eventId) })
}
