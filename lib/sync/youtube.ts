import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { parseYouTubeChannel } from '@/lib/music-ids'

const API = 'https://www.googleapis.com/youtube/v3'
/** Shorts are 3 minutes or less and vertical; we skip anything at or under 60s. */
const SHORTS_MAX_SEC = 60
const MAX_VIDEOS = 200

/**
 * API keys restricted to "Websites" (HTTP referrers) reject calls with no Referer, and server
 * requests send none. Sending the site's own address lets a key locked to beejaysax.com work.
 */
export function youtubeHeaders() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')
  return { Referer: `${site}/` }
}

/** Makes YouTube's key-restriction errors say what to change. */
export function youtubeErrorMessage(message: string) {
  return /referer|referrer/i.test(message)
    ? `${message} The API key only allows certain websites. In Google Cloud → Credentials, add beejaysax.com/* to its website list, or set its restriction to the server's IP address.`
    : message
}

async function yt<T>(path: string, key: string): Promise<T> {
  const res = await fetch(`${API}${path}${path.includes('?') ? '&' : '?'}key=${key}`, {
    headers: youtubeHeaders(),
    signal: AbortSignal.timeout(15_000),
  })
  const d = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!res.ok) throw new Error(`YouTube: ${youtubeErrorMessage(d.error?.message ?? String(res.status))}`)
  return d
}

/** ISO-8601 duration (PT1H2M3S) → seconds */
export function durationSeconds(iso: string | undefined) {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0
}

type Thumbs = Record<string, { url: string } | undefined>
const bestThumb = (t: Thumbs | undefined) => t?.maxres?.url ?? t?.standard?.url ?? t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? null

/**
 * Imports public videos from the channel's uploads. Never un-hides a video an admin hid,
 * never changes featured/order, and keeps admin-edited titles (lockedFields).
 * Videos that disappear from the channel (deleted or made private) are hidden.
 */
export async function syncYouTube() {
  const [key, raw] = await Promise.all([getSetting('youtube.apiKey'), getSetting('youtube.channelId')])
  const channel = parseYouTubeChannel(raw)
  if (!key || !channel) throw new Error('YouTube isn’t set up: add the API key and channel in Settings.')

  const ch = await yt<{ items?: { id: string; snippet: { title: string }; contentDetails: { relatedPlaylists: { uploads: string } } }[] }>(
    `/channels?part=snippet,contentDetails&${channel.id ? `id=${channel.id}` : `forHandle=${encodeURIComponent(channel.handle!)}`}`,
    key
  )
  const c = ch.items?.[0]
  if (!c) throw new Error('YouTube channel not found.')

  const ids: string[] = []
  let pageToken = ''
  let complete = false
  while (ids.length < MAX_VIDEOS) {
    const page = await yt<{ items: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>(
      `/playlistItems?part=contentDetails&maxResults=50&playlistId=${c.contentDetails.relatedPlaylists.uploads}${pageToken ? `&pageToken=${pageToken}` : ''}`,
      key
    )
    ids.push(...page.items.map((i) => i.contentDetails.videoId))
    if (!page.nextPageToken) {
      complete = true
      break
    }
    pageToken = page.nextPageToken
  }

  let created = 0
  let updated = 0
  let skippedShorts = 0
  const seen = new Set<string>()
  for (let i = 0; i < ids.length; i += 50) {
    const batch = await yt<{
      items: {
        id: string
        snippet: { title: string; description: string; publishedAt: string; thumbnails: Thumbs }
        contentDetails: { duration: string }
        status: { privacyStatus: string; embeddable: boolean }
      }[]
    }>(`/videos?part=snippet,contentDetails,status&id=${ids.slice(i, i + 50).join(',')}`, key)

    for (const v of batch.items) {
      if (v.status.privacyStatus !== 'public' || !v.status.embeddable) continue
      const secs = durationSeconds(v.contentDetails.duration)
      if (secs > 0 && secs <= SHORTS_MAX_SEC) {
        skippedShorts++
        continue
      }
      seen.add(v.id)
      const fields = {
        thumbnailUrl: bestThumb(v.snippet.thumbnails),
        publishedAt: new Date(v.snippet.publishedAt),
        durationSec: secs || null,
        lastSyncedAt: new Date(),
      }
      const existing = await prisma.video.findFirst({ where: { youtubeId: v.id } })
      if (!existing) {
        await prisma.video.create({
          data: { ...fields, youtubeId: v.id, title: v.snippet.title, description: v.snippet.description.slice(0, 1000), source: 'youtube' },
        })
        created++
      } else {
        await prisma.video.update({
          where: { id: existing.id },
          data: {
            ...fields,
            source: existing.source ?? 'youtube',
            ...(existing.lockedFields.includes('title') ? {} : { title: v.snippet.title }),
          },
        })
        updated++
      }
    }
  }

  // Only when we saw the whole channel can we say a video is gone.
  let hidden = 0
  if (complete) {
    const r = await prisma.video.updateMany({
      where: { source: 'youtube', isHidden: false, youtubeId: { notIn: [...seen] } },
      data: { isHidden: true },
    })
    hidden = r.count
  }
  return { channel: c.snippet.title, found: ids.length, created, updated, skippedShorts, hiddenRemoved: hidden }
}
