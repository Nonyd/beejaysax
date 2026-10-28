import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminApi } from '@/lib/admin-auth'
import { CONTENT, type ContentKey } from '@/lib/content/registry'
import { ContentError, resetContent, saveContent } from '@/lib/content/store'

type Params = { params: Promise<{ key: string }> }

function known(key: string): key is ContentKey {
  return Object.prototype.hasOwnProperty.call(CONTENT, key)
}

/** Save a content section; the whole public site is refreshed so changes show immediately. */
export async function PUT(req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { key } = await params
  if (!known(key)) return NextResponse.json({ error: 'Unknown section.' }, { status: 404 })
  try {
    const values = await saveContent(key, await req.json(), gate.user?.name ?? undefined)
    revalidatePath('/', 'layout')
    return NextResponse.json({ values })
  } catch (e) {
    if (e instanceof ContentError) return NextResponse.json({ error: e.message }, { status: 400 })
    console.error('[content] save failed', e)
    return NextResponse.json({ error: 'Changes could not be saved. Try again.' }, { status: 500 })
  }
}

/** Restore the original text for a section. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const { key } = await params
  if (!known(key)) return NextResponse.json({ error: 'Unknown section.' }, { status: 404 })
  const values = await resetContent(key)
  revalidatePath('/', 'layout')
  return NextResponse.json({ values })
}
