import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'
import { saveEvent, ValidationError } from '@/lib/events/admin'
import { PUBLIC_EVENT_SELECT } from '@/lib/events/public'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const event = await prisma.event.findFirst({ where: { id, status: { not: 'DRAFT' } }, select: PUBLIC_EVENT_SELECT })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

function revalidate(id: string) {
  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
  revalidatePath('/')
}

export async function PUT(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  if (!(await prisma.event.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }
  try {
    await saveEvent(id, await req.json())
    revalidate(id)
    return NextResponse.json({ id })
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[events] update failed', e)
    return NextResponse.json({ error: 'The event could not be saved. Try again.' }, { status: 500 })
  }
}

/** Quick status changes from the events list (publish, cancel, mark past). */
export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const body = (await req.json().catch(() => ({}))) as { status?: string; isFeatured?: boolean }
  const data: { status?: 'DRAFT' | 'UPCOMING' | 'PAST' | 'CANCELLED'; isFeatured?: boolean } = {}
  if (body.status && ['DRAFT', 'UPCOMING', 'PAST', 'CANCELLED'].includes(body.status)) data.status = body.status as typeof data.status
  if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured
  if (!Object.keys(data).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 })
  await prisma.event.update({ where: { id }, data })
  revalidate(id)
  return NextResponse.json({ id, ...data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const sold = await prisma.order.count({ where: { eventId: id, status: { in: ['PAID', 'FREE'] } } })
  const legacy = await prisma.ticket.count({ where: { eventId: id, orderId: null } })
  if (sold + legacy > 0) {
    return NextResponse.json(
      { error: 'This event has ticket holders, so it can’t be deleted. Mark it as cancelled instead.' },
      { status: 409 }
    )
  }
  await prisma.event.delete({ where: { id } })
  revalidate(id)
  return NextResponse.json({ success: true })
}
