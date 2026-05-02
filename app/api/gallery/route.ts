import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const image = await prisma.galleryImage.create({ data })
  return NextResponse.json(image)
}
