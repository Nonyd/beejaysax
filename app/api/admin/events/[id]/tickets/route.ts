import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { sendTicketsEmail } from '@/lib/events/notify'
import { refundOrder } from '@/lib/payments/fulfil'

type Action = 'resend' | 'checkin' | 'undo_checkin' | 'cancel' | 'restore' | 'refund'

/** Bulk actions on an event's tickets from the registrations page. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { action?: Action; ticketIds?: unknown }
  const ids = Array.isArray(body.ticketIds) ? body.ticketIds.filter((x): x is string => typeof x === 'string').slice(0, 500) : []
  if (!ids.length) return NextResponse.json({ error: 'Select at least one ticket.' }, { status: 400 })
  const where = { id: { in: ids }, eventId: id }
  const by = gate.user?.name ?? gate.user?.email ?? 'admin'

  switch (body.action) {
    case 'resend': {
      const r = await sendTicketsEmail(ids)
      if (r.failed.length) {
        return NextResponse.json(
          { done: r.sent, error: `Sent ${r.sent}; failed for ${r.failed.map((f) => f.email).join(', ')}: ${r.failed[0].error}` },
          { status: 502 }
        )
      }
      return NextResponse.json({ done: r.sent })
    }
    case 'checkin': {
      const r = await prisma.ticket.updateMany({
        where: { ...where, isUsed: false, cancelledAt: null },
        data: { isUsed: true, usedAt: new Date(), usedByAdmin: by },
      })
      return NextResponse.json({ done: r.count })
    }
    case 'undo_checkin': {
      const r = await prisma.ticket.updateMany({ where, data: { isUsed: false, usedAt: null, usedByAdmin: null } })
      return NextResponse.json({ done: r.count })
    }
    case 'cancel': {
      const r = await prisma.ticket.updateMany({ where: { ...where, cancelledAt: null }, data: { cancelledAt: new Date() } })
      return NextResponse.json({ done: r.count })
    }
    case 'restore': {
      const r = await prisma.ticket.updateMany({ where, data: { cancelledAt: null } })
      return NextResponse.json({ done: r.count })
    }
    case 'refund': {
      // Refunds whole orders: every ticket bought in the same checkout is refunded together.
      const tickets = await prisma.ticket.findMany({ where: { ...where, orderId: { not: null } }, select: { orderId: true } })
      const orderIds = [...new Set(tickets.map((t) => t.orderId!))]
      const done: string[] = []
      const errors: string[] = []
      for (const oid of orderIds) {
        try {
          done.push(await refundOrder(oid, by))
        } catch (e) {
          errors.push(e instanceof Error ? e.message : 'Refund failed')
        }
      }
      if (!orderIds.length) return NextResponse.json({ error: 'None of the selected tickets were bought online.' }, { status: 400 })
      if (errors.length) return NextResponse.json({ done: done.length, error: errors.join(' ') }, { status: 502 })
      return NextResponse.json({ done: done.length })
    }
    default:
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }
}
