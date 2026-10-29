import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { duplicateEvent } from '@/lib/events/admin'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const copy = await duplicateEvent(id)
  if (!copy) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  return NextResponse.json({ id: copy.id })
}
