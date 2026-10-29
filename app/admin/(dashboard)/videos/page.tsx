import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SyncPanel from '@/components/admin/SyncPanel'
import VideosClient from '@/components/admin/VideosClient'
import { getSetting } from '@/lib/settings'
import { getSyncStatus } from '@/lib/sync/run'

export const dynamic = 'force-dynamic'

export default async function AdminVideosPage() {
  await requireAdmin('videos')
  const [videos, status, key, channel] = await Promise.all([
    prisma.video.findMany({ orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }] }),
    getSyncStatus('youtube'),
    getSetting('youtube.apiKey'),
    getSetting('youtube.channelId'),
  ])

  return (
    <div>
      <AdminPageHeader
        eyebrow="Media"
        title="Videos"
        subtitle="Videos come from the YouTube channel automatically. Feature the ones to show on the home page, hide any you don’t want, or add one by link."
      />
      <SyncPanel source="youtube" label="YouTube channel" configured={Boolean(key && channel)} status={status} />
      <VideosClient
        videos={videos.map((v) => ({
          id: v.id,
          youtubeId: v.youtubeId,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
          publishedAt: v.publishedAt?.toISOString() ?? null,
          isFeatured: v.isFeatured,
          isHidden: v.isHidden,
          synced: v.source === 'youtube',
        }))}
      />
    </div>
  )
}
