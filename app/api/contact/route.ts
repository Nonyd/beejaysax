import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InquiryType } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = body.phone ? String(body.phone).trim() : undefined
    const subject = String(body.subject ?? '').trim()
    const message = String(body.message ?? '').trim()
    const inquiryRaw = String(body.inquiryType ?? 'GENERAL').toUpperCase()
    const inquiryType = (['BOOKING', 'COLLABORATION', 'MEDIA', 'GENERAL'] as const).includes(
      inquiryRaw as InquiryType
    )
      ? (inquiryRaw as InquiryType)
      : 'GENERAL'

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.contactMessage.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        inquiryType,
        subject,
        message,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
