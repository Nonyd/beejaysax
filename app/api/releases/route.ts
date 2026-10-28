import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'
import { parseReleaseInput, ReleaseInputError } from '@/lib/releases'

export async function GET() {
  const releases = await prisma.release.findMany({ where: { isHidden: false }, orderBy: { releaseDate: 'desc' } })
  return NextResponse.json(releases)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  try {
    const data = parseReleaseInput(await req.json())
    if (await prisma.release.findUnique({ where: { slug: String(data.slug) } })) {
      return NextResponse.json({ error: 'Another release already uses that URL slug. Change the title or slug.' }, { status: 409 })
    }
    const release = await prisma.release.create({ data: data as Parameters<typeof prisma.release.create>[0]['data'] })
    revalidatePath('/releases')
    revalidatePath('/')
    return NextResponse.json(release)
  } catch (e) {
    if (e instanceof ReleaseInputError) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }
}
