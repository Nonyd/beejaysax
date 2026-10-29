import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { UserError, deleteUser, listUsers, updateUser } from '@/lib/users'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('users')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  try {
    await updateUser(id, (await req.json().catch(() => ({}))) ?? {}, gate.id)
  } catch (e) {
    if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[users] update failed', e)
    return NextResponse.json({ error: 'The user could not be saved. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ users: await listUsers() })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('users')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  try {
    await deleteUser(id, gate.id)
  } catch (e) {
    if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[users] delete failed', e)
    return NextResponse.json({ error: 'The user could not be deleted. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ users: await listUsers() })
}
