import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

/** Hide/show, feature, retitle (locks the title against sync), reorder. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const v = await prisma.video.findUnique({ where: { id } })
  if (!v) return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
  const b = (await req.json().catch(() => ({}))) as { isHidden?: boolean; isFeatured?: boolean; title?: string; sortOrder?: number }
  const data: Record<string, unknown> = {}
  if (typeof b.isHidden === 'boolean') data.isHidden = b.isHidden
  if (typeof b.isFeatured === 'boolean') data.isFeatured = b.isFeatured
  if (typeof b.sortOrder === 'number' && Number.isInteger(b.sortOrder)) data.sortOrder = b.sortOrder
  if (typeof b.title === 'string' && b.title.trim() && b.title.trim() !== v.title) {
    data.title = b.title.trim().slice(0, 200)
    data.lockedFields = [...new Set([...v.lockedFields, 'title'])]
  }
  const video = await prisma.video.update({ where: { id }, data })
  revalidatePath('/')
  return NextResponse.json({ video })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const v = await prisma.video.findUnique({ where: { id } })
  if (!v) return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
  // Synced videos would return on the next sync, so they are hidden instead.
  if (v.source === 'youtube') {
    await prisma.video.update({ where: { id }, data: { isHidden: true } })
    revalidatePath('/')
    return NextResponse.json({ hidden: true })
  }
  await prisma.video.delete({ where: { id } })
  revalidatePath('/')
  return NextResponse.json({ deleted: true })
}
