import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminApi('gallery')
  if (gate instanceof NextResponse) return gate
  const data = await req.json()
  const image = await prisma.galleryImage.create({ data })
  return NextResponse.json(image)
}
