import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { UserError, createUser, listUsers } from '@/lib/users'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gate = await requireAdminApi('users')
  if (gate instanceof NextResponse) return gate
  return NextResponse.json({ users: await listUsers() })
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminApi('users')
  if (gate instanceof NextResponse) return gate
  try {
    await createUser((await req.json().catch(() => ({}))) ?? {})
  } catch (e) {
    if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[users] create failed', e)
    return NextResponse.json({ error: 'The user could not be created. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ users: await listUsers() })
}
