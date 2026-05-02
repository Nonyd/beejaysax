import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const releases = await prisma.release.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(releases)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const release = await prisma.release.create({ data })
  return NextResponse.json(release)
}
