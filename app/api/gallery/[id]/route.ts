import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('gallery')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const data = await req.json()
  const image = await prisma.galleryImage.update({ where: { id }, data })
  return NextResponse.json(image)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('gallery')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  await prisma.galleryImage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
