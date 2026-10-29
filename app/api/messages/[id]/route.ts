import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('messages')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const data = await req.json()
  const message = await prisma.contactMessage.update({ where: { id }, data })
  return NextResponse.json(message)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('messages')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  await prisma.contactMessage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
