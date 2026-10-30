import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { revalidateEventPages } from '@/lib/events/cache'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const b = (await req.json().catch(() => ({}))) as { isActive?: boolean }
  if (typeof b.isActive !== 'boolean') return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 })
  const coupon = await prisma.coupon.update({ where: { id }, data: { isActive: b.isActive } })
  revalidateEventPages(coupon.eventId)
  return NextResponse.json({ coupon })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const { eventId } = await prisma.coupon.findUniqueOrThrow({ where: { id }, select: { eventId: true } })
  revalidateEventPages(eventId)
  const used = await prisma.order.count({ where: { couponId: id } })
  if (used > 0) {
    await prisma.coupon.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ deactivated: true })
  }
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
