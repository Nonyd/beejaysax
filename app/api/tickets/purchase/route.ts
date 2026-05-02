import { NextResponse } from 'next/server'
import { PaymentStatus, TicketType, type Event } from '@prisma/client'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { generateQRCodeDataURL, generateQRToken } from '@/lib/qrcode'
import { sendTicketConfirmationEmail } from '@/lib/resend'

const TICKET_TYPES: TicketType[] = ['GENERAL', 'VIP', 'VVIP', 'FREE']

function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
}

function randomTicketNumber(year: number): string {
  return `BJS-${year}-${randomBytes(4).toString('hex').toUpperCase()}`
}

function parseTicketType(raw: unknown, event: Event): TicketType {
  const u = String(raw ?? 'GENERAL').toUpperCase()
  const t = TICKET_TYPES.includes(u as TicketType) ? (u as TicketType) : 'GENERAL'
  if (event.isFree) return 'FREE'
  if (t === 'FREE') return 'GENERAL'
  return t
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const eventId = String(body.eventId ?? '').trim()
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const phone = body.phone ? String(body.phone).trim() : undefined
    const quantityRaw = Number(body.quantity ?? 1)
    const quantity = Number.isFinite(quantityRaw) ? Math.floor(quantityRaw) : 1

    if (!eventId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'UPCOMING') {
      return NextResponse.json({ error: 'This event is not open for tickets' }, { status: 400 })
    }

    if (!event.isFree && (event.ticketPrice == null || event.ticketPrice <= 0)) {
      return NextResponse.json({ error: 'Ticket price is not set for this event' }, { status: 400 })
    }

    const ticketType = parseTicketType(body.ticketType, event)

    const sold = await prisma.ticket.count({
      where: {
        eventId,
        paymentStatus: { not: 'REFUNDED' },
      },
    })

    if (event.totalTickets != null && sold + quantity > event.totalTickets) {
      return NextResponse.json({ error: 'Not enough tickets remaining' }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const base = siteBase()
    const unitPrice = event.isFree ? 0 : (event.ticketPrice ?? 0)
    const paymentStatus: PaymentStatus = event.isFree ? 'FREE' : 'PAID'
    const paymentRef = event.isFree ? null : `checkout-${randomBytes(12).toString('hex')}`

    const created = await prisma.$transaction(async (tx) => {
      const rows: Awaited<ReturnType<typeof tx.ticket.create>>[] = []
      for (let i = 0; i < quantity; i++) {
        const qrToken = generateQRToken()
        const qrCode = await generateQRCodeDataURL(qrToken, base)
        const ticketNumber = randomTicketNumber(year)
        const totalAmount = unitPrice

        const row = await tx.ticket.create({
          data: {
            ticketNumber,
            eventId,
            firstName,
            lastName,
            email,
            phone,
            ticketType,
            quantity: 1,
            totalAmount,
            qrCode,
            qrToken,
            paymentStatus,
            paymentRef,
          },
        })
        rows.push(row)
      }
      return rows
    })

    const lines = created.map((t) => ({
      ticketNumber: t.ticketNumber,
      qrDataUrl: t.qrCode,
      viewUrl: `${base}/tickets/${t.qrToken}`,
    }))

    const emailResult = await sendTicketConfirmationEmail({
      to: email,
      attendeeFirstName: firstName,
      eventTitle: event.title,
      eventDate: event.eventDate,
      venue: event.venue,
      city: event.city,
      country: event.country,
      tickets: lines,
    })

    return NextResponse.json({
      success: true,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? undefined : emailResult.message,
      tickets: created.map((t) => ({ id: t.id, qrToken: t.qrToken })),
      primaryToken: created[0]?.qrToken,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
