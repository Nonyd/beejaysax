import type { Metadata } from 'next'
import PageHero from '@/components/ui/PageHero'
import VideoGallery from '@/components/videos/VideoGallery'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'

type Props = { searchParams: Promise<{ v?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { v } = await searchParams
  const video = v ? await safeDb(() => prisma.video.findFirst({ where: { youtubeId: v, isHidden: false } }), null) : null
  const image = video ? (video.thumbnailUrl ?? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`) : undefined
  return {
    title: { absolute: video ? `${video.title} — BeeJay Sax` : 'Videos — BeeJay Sax' },
    description: 'Live ministrations, worship sessions and performances by BeeJay Sax.',
    openGraph: {
      title: video?.title ?? 'BeeJay Sax — Videos',
      description: 'Live ministrations, worship sessions and performances.',
      url: `https://beejaysax.com/videos${video ? `?v=${video.youtubeId}` : ''}`,
      images: image ? [{ url: image }] : undefined,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function VideosPage({ searchParams }: Props) {
  const [{ v }, h] = await Promise.all([searchParams, getContent('pageHeaders')])
  const rows = await safeDb(
    () =>
      prisma.video.findMany({
        where: { isHidden: false },
        orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      }),
    []
  )
  const videos = rows.map((r) => ({
    id: r.id,
    youtubeId: r.youtubeId,
    title: r.title,
    description: r.description,
    thumbnail: r.thumbnailUrl,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    durationSec: r.durationSec,
  }))
  // Open on the shared video, else the featured one, else the newest.
  const featured = rows.find((r) => r.isFeatured)
  const initialId = videos.some((x) => x.youtubeId === v) ? v! : (featured?.youtubeId ?? null)

  return (
    <>
      <PageHero title={[h.videosTitle]} intro={h.videosIntro} />
      <VideoGallery videos={videos} initialId={initialId} />
    </>
  )
}
