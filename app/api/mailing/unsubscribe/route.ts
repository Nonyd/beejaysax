import { NextRequest, NextResponse } from 'next/server'
import { setContactStatusByToken } from '@/lib/mailing/contacts'

export const runtime = 'nodejs'

/**
 * POST ?t=<token>                     one-click unsubscribe (Gmail/Yahoo "Unsubscribe" button, RFC 8058)
 * POST ?t=<token>&action=resubscribe  from the /unsubscribe page
 * Links in emails open the /unsubscribe page instead, so link scanners can't unsubscribe anyone by visiting them.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') ?? ''
  const resubscribe = req.nextUrl.searchParams.get('action') === 'resubscribe'
  const c = token ? await setContactStatusByToken(token, resubscribe ? 'SUBSCRIBED' : 'UNSUBSCRIBED') : null
  if (!c) return NextResponse.json({ error: 'This link is no longer valid.' }, { status: 404 })
  return NextResponse.json({ ok: true, status: c.status })
}
