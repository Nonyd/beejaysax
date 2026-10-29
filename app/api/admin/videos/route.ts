import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { parseYouTubeVideoId } from '@/lib/music-ids'

/** Add a video by hand (e.g. from another channel). */
export async function POST(req: NextRequest) {
  const gate = await requireAdminApi('videos')
  if (gate instanceof NextResponse) return gate
  const b = (await req.json().catch(() => ({}))) as { url?: string; title?: string }
  const youtubeId = parseYouTubeVideoId(String(b.url ?? ''))
  if (!youtubeId) return NextResponse.json({ error: 'Paste a YouTube video link.' }, { status: 400 })
  const title = String(b.title ?? '').trim().slice(0, 200)
  if (!title) return NextResponse.json({ error: 'Add a title.' }, { status: 400 })
  if (await prisma.video.findFirst({ where: { youtubeId } })) return NextResponse.json({ error: 'That video is already in the list.' }, { status: 409 })
  const video = await prisma.video.create({
    data: { youtubeId, title, thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`, lockedFields: ['title'] },
  })
  revalidatePath('/')
  return NextResponse.json({ video })
}
