import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import VideoSection, { type HomeVideo } from '@/components/home/VideoSection'

/** Shown until the YouTube channel has been synced. */
const FALLBACK: HomeVideo[] = [{ id: '0jxRD456j_w', title: 'BeeJay Sax live in London, Indigo at The O2' }]

/** Featured videos first (up to 3), otherwise the newest one. */
export default async function Videos() {
  const rows = await safeDb(
    () =>
      prisma.video.findMany({
        where: { isHidden: false },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: 3,
      }),
    []
  )
  const featured = rows.filter((r) => r.isFeatured)
  const pick = featured.length ? featured : rows.slice(0, 1)
  const videos = pick.length ? pick.map((v) => ({ id: v.youtubeId, title: v.title, thumbnail: v.thumbnailUrl })) : FALLBACK
  return <VideoSection videos={videos} />
}
