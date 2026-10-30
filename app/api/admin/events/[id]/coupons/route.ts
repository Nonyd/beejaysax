import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { revalidateEventPages } from '@/lib/events/cache'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const coupons = await prisma.coupon.findMany({ where: { eventId: id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('events')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const code = String(b.code ?? '').trim().toUpperCase().replace(/\s+/g, '')
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    return NextResponse.json({ error: 'Use 3–30 letters, numbers, dashes or underscores for the code.' }, { status: 400 })
  }
  const percentOff = b.percentOff === '' || b.percentOff == null ? null : Number(b.percentOff)
  const amountOff = b.amountOff === '' || b.amountOff == null ? null : Number(b.amountOff)
  if ((percentOff == null) === (amountOff == null)) {
    return NextResponse.json({ error: 'Give either a percentage or a fixed amount off.' }, { status: 400 })
  }
  if (percentOff != null && (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100)) {
    return NextResponse.json({ error: 'Percentage must be between 1 and 100.' }, { status: 400 })
  }
  if (amountOff != null && (!Number.isFinite(amountOff) || amountOff <= 0)) {
    return NextResponse.json({ error: 'The amount off must be more than 0.' }, { status: 400 })
  }
  const maxUses = b.maxUses === '' || b.maxUses == null ? null : Math.floor(Number(b.maxUses))
  const endsAt = b.endsAt ? new Date(String(b.endsAt)) : null

  if (await prisma.coupon.findUnique({ where: { code } })) {
    return NextResponse.json({ error: `The code ${code} already exists.` }, { status: 409 })
  }
  const coupon = await prisma.coupon.create({
    data: {
      code,
      eventId: id,
      percentOff,
      amountOff,
      maxUses: maxUses && maxUses > 0 ? maxUses : null,
      endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
    },
  })
  revalidateEventPages(id) // the checkout shows the discount field only when a code exists
  return NextResponse.json({ coupon })
}
