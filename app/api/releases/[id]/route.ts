import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'
import { newlyLocked, parseReleaseInput, ReleaseInputError } from '@/lib/releases'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('releases')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const current = await prisma.release.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: 'Release not found.' }, { status: 404 })
  try {
    const data = parseReleaseInput(await req.json(), true)
    if (data.slug && data.slug !== current.slug && (await prisma.release.findUnique({ where: { slug: String(data.slug) } }))) {
      return NextResponse.json({ error: 'Another release already uses that URL slug.' }, { status: 409 })
    }
    // Hand edits to a Spotify-synced release are protected from the next sync.
    const lock = current.spotifyAlbumId ? newlyLocked(current as unknown as Record<string, unknown>, data) : []
    const release = await prisma.release.update({
      where: { id },
      data: { ...data, ...(lock.length ? { lockedFields: [...new Set([...current.lockedFields, ...lock])] } : {}) },
    })
    revalidatePath('/releases')
    revalidatePath(`/releases/${release.slug}`)
    revalidatePath('/')
    return NextResponse.json(release)
  } catch (e) {
    if (e instanceof ReleaseInputError) return NextResponse.json({ error: e.message }, { status: 400 })
    throw e
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi('releases')
  if (gate instanceof NextResponse) return gate
  const { id } = await params
  const r = await prisma.release.findUnique({ where: { id } })
  if (!r) return NextResponse.json({ error: 'Release not found.' }, { status: 404 })
  // A synced release would come straight back on the next sync, so hide it instead.
  if (r.spotifyAlbumId) {
    await prisma.release.update({ where: { id }, data: { isHidden: true } })
    revalidatePath('/releases')
    return NextResponse.json({ hidden: true })
  }
  await prisma.release.delete({ where: { id } })
  revalidatePath('/releases')
  return NextResponse.json({ success: true })
}
