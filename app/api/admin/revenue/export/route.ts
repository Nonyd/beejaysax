import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { parseRevenueFilter, revenueWhere } from '@/lib/revenue'

export const runtime = 'nodejs'

/** Quotes every cell and neutralises spreadsheet formulas (buyer names come from the public checkout). */
const cell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`
}

/** CSV of the paid and refunded orders behind the Revenue page, with the same filters. */
export async function GET(req: NextRequest) {
  const gate = await requireAdminApi('revenue')
  if (gate instanceof NextResponse) return gate
  const p = req.nextUrl.searchParams
  const filter = parseRevenueFilter({ mode: p.get('mode'), event: p.get('event'), from: p.get('from'), to: p.get('to') })
  const orders = await prisma.order.findMany({
    where: revenueWhere(filter),
    orderBy: { paidAt: 'asc' },
    include: { event: { select: { title: true } }, tier: { select: { name: true } }, coupon: { select: { code: true } } },
  })

  const header = ['Paid at', 'Reference', 'Paystack ID', 'Mode', 'Status', 'Event', 'Ticket type', 'Quantity', 'Unit price', 'Gross', 'Discount', 'Discount code', 'Processing fee (buyer)', 'Buyer paid', 'Paystack fee', 'Refunded', 'Net', 'Currency', 'First name', 'Last name', 'Email', 'Phone']
  const lines = [header.map(cell).join(',')]
  for (const o of orders) {
    const refunded = o.status === 'REFUNDED' ? (o.refundedAmount ?? o.total) : 0
    const fee = o.gatewayFee ?? 0
    lines.push(
      [
        o.paidAt?.toISOString() ?? '',
        o.reference,
        o.gatewayRef,
        o.paymentMode ?? '',
        o.status,
        o.event.title,
        o.tier?.name ?? '',
        o.quantity,
        o.unitPrice,
        o.subtotal,
        o.discount,
        o.coupon?.code ?? '',
        o.serviceFee,
        o.total,
        o.gatewayFee ?? '',
        refunded,
        Math.round((o.total - fee - refunded) * 100) / 100,
        o.currency,
        o.firstName,
        o.lastName,
        o.email,
        o.phone ?? '',
      ]
        .map(cell)
        .join(',')
    )
  }

  const name = `beejaysax-revenue-${filter.mode}-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(`\uFEFF${lines.join('\r\n')}`, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store' },
  })
}
