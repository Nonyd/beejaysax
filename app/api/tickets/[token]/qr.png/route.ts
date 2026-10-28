import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

/**
 * Hosted QR image for emails (Gmail and Outlook block inline data: images).
 * The QR encodes the ticket page URL; door scanners read the token from it.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{64}$/i.test(token)) return new Response('Not found', { status: 404 })
  const exists = await prisma.ticket.findUnique({ where: { qrToken: token }, select: { id: true } })
  if (!exists) return new Response('Not found', { status: 404 })

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
  const png = await QRCode.toBuffer(`${base}/tickets/${token}`, {
    errorCorrectionLevel: 'M',
    type: 'png',
    margin: 2,
    width: 440,
    color: { dark: '#11142F', light: '#FFFFFF' },
  })
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
