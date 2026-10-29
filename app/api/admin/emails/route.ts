import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { retryEmailNow, sendEmail } from '@/lib/email/send'
import { testEmail } from '@/lib/email/templates'

/**
 * Admin email tools.
 *   { action: 'test', to }          send a test email (bypasses the suppression list)
 *   { action: 'retry', id }         retry a failed/queued message now
 *   { action: 'unsuppress', email } allow emailing an address again
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdminApi('emails')
  if (gate instanceof NextResponse) return gate
  const b = (await req.json().catch(() => ({}))) as { action?: string; to?: string; id?: string; email?: string }

  if (b.action === 'test') {
    const to = String(b.to ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    const r = await sendEmail({ to, ...testEmail(), kind: 'TEST' })
    return r.ok
      ? NextResponse.json({ ok: true, provider: r.provider })
      : NextResponse.json({ error: `Not sent: ${r.error}` }, { status: 502 })
  }
  if (b.action === 'retry' && b.id) {
    const r = await retryEmailNow(b.id)
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 502 })
  }
  if (b.action === 'unsuppress' && b.email) {
    await prisma.emailSuppression.deleteMany({ where: { email: b.email.toLowerCase() } })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
