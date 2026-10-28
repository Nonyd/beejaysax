import { prisma } from '@/lib/prisma'

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
}

/** UTC timestamp; calendar apps convert it to the viewer's time zone correctly. */
function icsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ticket = token ? await prisma.ticket.findUnique({ where: { qrToken: token }, include: { event: true } }) : null
  if (!ticket) return new Response('Not found', { status: 404 })

  const ev = ticket.event
  const start = ev.eventDate
  const end = ev.endDate ?? new Date(start.getTime() + 3 * 3600_000)
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
  const location = [ev.venue, ev.address, ev.city, ev.country].filter(Boolean).join(', ')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeeJay Sax//Tickets//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ticket.id}@beejaysax.com`,
    `DTSTAMP:${icsUtc(new Date())}`,
    `DTSTART:${icsUtc(start)}`,
    `DTEND:${icsUtc(end)}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(`Ticket ${ticket.ticketNumber} for ${ticket.firstName} ${ticket.lastName}${ev.eventTime ? `\nDoors: ${ev.eventTime}` : ''}\n${base}/tickets/${token}`)}`,
    `URL:${base}/tickets/${token}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(ev.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="beejaysax-${ticket.ticketNumber}.ics"`,
    },
  })
}
