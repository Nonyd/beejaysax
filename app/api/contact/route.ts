import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InquiryType } from '@prisma/client'
import { getSetting } from '@/lib/settings'
import { sendEmail } from '@/lib/email/send'
import { adminContactNotice, contactAutoReply } from '@/lib/email/templates'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const s = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
    const firstName = s(body.firstName, 80)
    const lastName = s(body.lastName, 80)
    const email = s(body.email, 200).toLowerCase()
    const phone = body.phone ? s(body.phone, 40) : undefined
    const subject = s(body.subject, 200)
    const message = s(body.message, 5000)
    const inquiryRaw = String(body.inquiryType ?? 'GENERAL').toUpperCase()
    const inquiryType = (['BOOKING', 'COLLABORATION', 'MEDIA', 'GENERAL'] as const).includes(inquiryRaw as InquiryType)
      ? (inquiryRaw as InquiryType)
      : 'GENERAL'

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: 'Fill in your name, email, subject and message.' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Add a valid email address so we can reply.' }, { status: 400 })

    const saved = await prisma.contactMessage.create({
      data: { name: `${firstName} ${lastName}`, email, phone, inquiryType, subject, message },
    })

    // Emails are best-effort: the message is already saved in the admin inbox.
    const adminTo = await getSetting('email.adminNotify')
    await Promise.allSettled([
      sendEmail({ to: email, ...contactAutoReply({ firstName, subject }), kind: 'CONTACT', related: { type: 'contactMessage', id: saved.id } }),
      adminTo
        ? sendEmail({
            to: adminTo,
            ...adminContactNotice({ name: saved.name, email, phone, inquiryType, subject, message }),
            replyTo: email,
            kind: 'ADMIN',
            related: { type: 'contactMessage', id: saved.id },
          })
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[contact] failed', e)
    return NextResponse.json({ error: 'Your message was not sent. Try again.' }, { status: 500 })
  }
}
