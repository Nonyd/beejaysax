import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { createOrder, OrderError } from '@/lib/events/orders'
import { sendTicketsEmail } from '@/lib/events/notify'

/** Issue free complimentary/VIP tickets and email them to the guest. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const s = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const email = s(b.email).toLowerCase()
  if (!s(b.firstName) || !s(b.lastName)) return NextResponse.json({ error: 'Add the guest’s first and last name.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Add a valid email address.' }, { status: 400 })
  const quantity = Math.min(20, Math.max(1, Math.floor(Number(b.quantity ?? 1))))

  try {
    const { order, tickets } = await createOrder({
      eventId: id,
      tierId: s(b.tierId),
      quantity,
      buyer: { firstName: s(b.firstName), lastName: s(b.lastName), email, phone: s(b.phone) || undefined },
      source: 'COMPLIMENTARY',
      createdBy: gate.username,
      note: s(b.note) || undefined,
    })
    const mail = b.sendEmail === false ? null : await sendTicketsEmail(tickets.map((t) => t.id))
    return NextResponse.json({
      reference: order.reference,
      tickets: tickets.map((t) => ({ id: t.id, qrToken: t.qrToken })),
      emailed: mail ? mail.failed.length === 0 : false,
      emailError: mail?.failed[0]?.error,
    })
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[comp] failed', e)
    return NextResponse.json({ error: 'The ticket could not be issued. Try again.' }, { status: 500 })
  }
}
