import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { broadcastEmail } from '@/lib/email/templates'

export const maxDuration = 300

/** Email everyone holding a ticket (venue change, timing, parking…). `testTo` sends one preview only. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const b = (await req.json().catch(() => ({}))) as { subject?: string; message?: string; testTo?: string }
  const subject = String(b.subject ?? '').trim().slice(0, 150)
  const message = String(b.message ?? '').trim().slice(0, 8000)
  if (!subject || !message) return NextResponse.json({ error: 'Add a subject and a message.' }, { status: 400 })

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  const msg = broadcastEmail({ subject, message, event })

  if (b.testTo) {
    const r = await sendEmail({ to: b.testTo, ...msg, kind: 'TEST' })
    return r.ok ? NextResponse.json({ sent: 1, test: true }) : NextResponse.json({ error: r.error }, { status: 502 })
  }

  const rows = await prisma.ticket.findMany({
    where: { eventId: id, cancelledAt: null, paymentStatus: { not: 'REFUNDED' } },
    select: { email: true },
    distinct: ['email'],
  })
  let sent = 0
  const failed: string[] = []
  // Small parallel batches: fast enough for a few thousand guests without tripping provider rate limits.
  for (let i = 0; i < rows.length; i += 5) {
    const batch = rows.slice(i, i + 5)
    const rs = await Promise.all(batch.map((r) => sendEmail({ to: r.email, ...msg, kind: 'BROADCAST', related: { type: 'event', id } })))
    rs.forEach((r, j) => (r.ok ? sent++ : failed.push(batch[j].email)))
  }
  return NextResponse.json({ sent, failed: failed.length, total: rows.length })
}
