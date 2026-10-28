import QRCode from 'qrcode'
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont } from 'pdf-lib'
import { prisma } from '@/lib/prisma'
import { fmt } from '@/lib/time'

const INK = rgb(27 / 255, 31 / 255, 75 / 255)
const NIGHT = rgb(17 / 255, 20 / 255, 47 / 255)
const GOLD = rgb(227 / 255, 178 / 255, 60 / 255)
const IVORY = rgb(247 / 255, 241 / 255, 227 / 255)
const MUTED = rgb(0.36, 0.37, 0.5)

/** Standard PDF fonts only cover Latin-1; swap anything else so a title never breaks the PDF. */
function safe(s: string) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/₦/g, 'NGN ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const words = safe(text).split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(next, size) > max && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** A printable ticket (A6-ish) with the QR code, for people who prefer paper. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{64}$/i.test(token)) return new Response('Not found', { status: 404 })
  const t = await prisma.ticket.findUnique({ where: { qrToken: token }, include: { event: true } })
  if (!t) return new Response('Not found', { status: 404 })
  const ev = t.event
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')

  const pdf = await PDFDocument.create()
  pdf.setTitle(`${safe(ev.title)} ticket ${t.ticketNumber}`)
  pdf.setAuthor('BeeJay Sax')
  const W = 320
  const H = 560
  const page = pdf.addPage([W, H])
  const serif = await pdf.embedFont(StandardFonts.TimesRoman)
  const sans = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // background + header
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: IVORY })
  page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: INK })
  page.drawText('BeeJay', { x: 24, y: H - 52, size: 26, font: serif, color: IVORY })
  page.drawText('Sax', { x: 24 + serif.widthOfTextAtSize('BeeJay ', 26), y: H - 52, size: 26, font: serif, color: GOLD })
  page.drawText('OFFICIAL TICKET', { x: 24, y: H - 76, size: 8, font: bold, color: GOLD })
  // gold stub band with diamonds (adire nod)
  page.drawRectangle({ x: 0, y: H - 108, width: W, height: 12, color: GOLD })
  for (let x = 10; x < W; x += 20) {
    page.drawRectangle({ x, y: H - 105, width: 5, height: 5, color: NIGHT, rotate: degrees(45) })
  }

  let y = H - 140
  for (const line of wrap(ev.title, serif, 22, W - 48).slice(0, 3)) {
    page.drawText(line, { x: 24, y, size: 22, font: serif, color: INK })
    y -= 24
  }
  y -= 6
  const rows: [string, string][] = [
    ['DATE', fmt(ev.eventDate, 'EEE d MMM yyyy')],
    ['DOORS', ev.eventTime ?? fmt(ev.eventDate, 'h:mm a')],
    ['VENUE', `${ev.venue}, ${ev.city}`],
    ['TICKET', t.tierName ?? 'General admission'],
    ['HOLDER', `${t.firstName} ${t.lastName}`],
  ]
  for (const [k, v] of rows) {
    page.drawText(k, { x: 24, y, size: 7, font: bold, color: MUTED })
    const lines = wrap(v, sans, 11, W - 110).slice(0, 2)
    lines.forEach((l, i) => page.drawText(l, { x: 86, y: y - i * 13, size: 11, font: sans, color: INK }))
    y -= 13 * lines.length + 6
  }

  // tear line
  y -= 4
  for (let x = 12; x < W - 12; x += 8) page.drawLine({ start: { x, y }, end: { x: x + 4, y }, thickness: 1, color: MUTED, opacity: 0.5 })
  page.drawCircle({ x: 0, y, size: 9, color: NIGHT })
  page.drawCircle({ x: W, y, size: 9, color: NIGHT })

  const qr = await QRCode.toBuffer(`${base}/tickets/${token}`, { errorCorrectionLevel: 'M', margin: 1, width: 360, color: { dark: '#11142F', light: '#FFFFFF' } })
  const img = await pdf.embedPng(qr)
  const size = 170
  const qrY = y - 18 - size
  page.drawRectangle({ x: (W - size) / 2 - 8, y: qrY - 8, width: size + 16, height: size + 16, color: rgb(1, 1, 1) })
  page.drawImage(img, { x: (W - size) / 2, y: qrY, width: size, height: size })
  const num = t.ticketNumber
  page.drawText(num, { x: (W - bold.widthOfTextAtSize(num, 11)) / 2, y: qrY - 24, size: 11, font: bold, color: INK })
  const note = 'Show this code at the entrance. Valid for one entry.'
  page.drawText(note, { x: (W - sans.widthOfTextAtSize(note, 8)) / 2, y: qrY - 38, size: 8, font: sans, color: MUTED })

  page.drawRectangle({ x: 0, y: 0, width: W, height: 22, color: INK })
  page.drawText('beejaysax.com', { x: (W - sans.widthOfTextAtSize('beejaysax.com', 8)) / 2, y: 8, size: 8, font: sans, color: IVORY })

  const bytes = await pdf.save()
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="beejaysax-${t.ticketNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
