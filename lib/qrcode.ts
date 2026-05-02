import QRCode from 'qrcode'
import { randomBytes } from 'crypto'

export function generateQRToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateTicketNumber(index: number): string {
  const year = new Date().getFullYear()
  const padded = String(index).padStart(4, '0')
  return `BJS-${year}-${padded}`
}

export async function generateQRCodeDataURL(token: string, baseUrl: string): Promise<string> {
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/tickets/${token}`
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    color: {
      dark: '#080808',
      light: '#F5F0E8',
    },
    width: 300,
  })
}
