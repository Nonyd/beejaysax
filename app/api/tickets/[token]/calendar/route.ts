import { prisma } from '@/lib/prisma'

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
}

/** Floating local time (no trailing Z) for typical calendar apps. */
function formatIcsFloatingLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  )
}

function formatIcsUtcStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!token) {
    return new Response('Not found', { status: 404 })
  }

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: { event: true },
  })

  if (!ticket) {
    return new Response('Not found', { status: 404 })
  }

  const ev = ticket.event
  const start = new Date(ev.eventDate)
  let end = new Date(start.getTime() + 3 * 60 * 60 * 1000)

  if (ev.eventTime) {
    const m = ev.eventTime.match(/(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)?/i)
    if (m) {
      let h = parseInt(m[1], 10)
      const min = parseInt(m[2], 10)
      const ap = m[3]?.toLowerCase()
      if (ap === 'pm' && h < 12) h += 12
      if (ap === 'am' && h === 12) h = 0
      start.setHours(h, min, 0, 0)
      end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
    }
  }

  const uid = `${ticket.id}@beejaysax.com`
  const location = [ev.venue, ev.city, ev.country].filter(Boolean).join(', ')
  const summary = escapeIcs(ev.title)
  const desc = escapeIcs(`Ticket ${ticket.ticketNumber} — ${ticket.firstName} ${ticket.lastName}`)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeeJay Sax//Tickets//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtcStamp(new Date())}`,
    `DTSTART:${formatIcsFloatingLocal(start)}`,
    `DTEND:${formatIcsFloatingLocal(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${escapeIcs(location)}`,
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
