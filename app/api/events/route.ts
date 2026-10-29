import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'
import { saveEvent, ValidationError } from '@/lib/events/admin'
import { PUBLIC_EVENT_SELECT } from '@/lib/events/public'

/** Public list: published events only, no admin fields. */
export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: { not: 'DRAFT' } },
    orderBy: { eventDate: 'desc' },
    select: PUBLIC_EVENT_SELECT,
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  try {
    const event = await saveEvent(null, await req.json())
    revalidatePath('/events')
    revalidatePath('/')
    return NextResponse.json({ id: event.id })
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[events] create failed', e)
    return NextResponse.json({ error: 'The event could not be saved. Try again.' }, { status: 500 })
  }
}
