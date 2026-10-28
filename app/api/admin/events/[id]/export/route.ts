import { NextResponse } from 'next/server'
import { fmt } from '@/lib/time'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

function csvCell(v: unknown) {
  const s = v == null ? '' : String(v)
  // Neutralise spreadsheet formulas and quote everything.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

/** Attendee list as CSV (opens in Excel / Google Sheets). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true, slug: true } })
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })

  const tickets = await prisma.ticket.findMany({
    where: { eventId: id },
    include: { order: { select: { reference: true, status: true, total: true, source: true, coupon: { select: { code: true } } } } },
    orderBy: { createdAt: 'asc' },
  })

  const header = [
    'Ticket number', 'First name', 'Last name', 'Email', 'Phone', 'Ticket type', 'Amount paid',
    'Order reference', 'Order status', 'Source', 'Discount code', 'Checked in', 'Checked in at', 'Checked in by', 'Cancelled', 'Issued',
  ]
  const rows = tickets.map((t) => [
    t.ticketNumber, t.firstName, t.lastName, t.email, t.phone, t.tierName ?? t.ticketType, t.totalAmount,
    t.order?.reference ?? t.paymentRef, t.order?.status ?? t.paymentStatus, t.order?.source ?? 'PUBLIC', t.order?.coupon?.code,
    t.isUsed ? 'Yes' : 'No', t.usedAt ? fmt(t.usedAt, 'yyyy-MM-dd HH:mm') : '', t.usedByAdmin,
    t.cancelledAt ? 'Yes' : 'No', fmt(t.createdAt, 'yyyy-MM-dd HH:mm'),
  ])
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const name = `${event.slug ?? 'event'}-attendees-${fmt(new Date(), 'yyyyMMdd')}.csv`
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"` },
  })
}
