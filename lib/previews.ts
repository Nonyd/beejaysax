/**
 * 30-second track previews for the site's mini player, from the free iTunes lookup API.
 * Each release's Apple Music link (found by the Spotify sync, or pasted by an admin) names the
 * album; the lookup returns its tracks with preview clips. Results are cached for a day.
 */
export type PreviewTrack = {
  id: string
  title: string
  trackNumber: number
  durationMs: number | null
  previewUrl: string | null
}

export type PreviewRelease = {
  id: string
  title: string
  coverImage: string | null
  tracks: PreviewTrack[]
}

const LOOKUP = 'https://itunes.apple.com/lookup'
const DAY = 86_400

/** music.apple.com/ng/album/name/1234567890 → { id: '1234567890', country: 'ng' } */
export function appleCollection(url: string | null | undefined): { id: string; country: string } | null {
  const m = url?.match(/music\.apple\.com\/([a-z]{2})\/(?:album|song)\/(?:[^/]+\/)?(\d+)/i)
  return m ? { id: m[2], country: m[1].toLowerCase() } : null
}

type LookupResult = {
  wrapperType?: string
  kind?: string
  trackId?: number
  trackName?: string
  trackNumber?: number
  discNumber?: number
  trackTimeMillis?: number
  previewUrl?: string
}

async function lookup(id: string, country: string): Promise<PreviewTrack[]> {
  const q = new URLSearchParams({ id, entity: 'song', country })
  const res = await fetch(`${LOOKUP}?${q}`, { next: { revalidate: DAY }, signal: AbortSignal.timeout(8_000) })
  if (!res.ok) return []
  const d = (await res.json()) as { results?: LookupResult[] }
  return (d.results ?? [])
    .filter((r) => (r.wrapperType === 'track' || r.kind === 'song') && r.trackName && r.trackId)
    .sort((a, b) => (a.discNumber ?? 1) - (b.discNumber ?? 1) || (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
    .map((r, i) => ({
      id: String(r.trackId),
      title: r.trackName!,
      trackNumber: i + 1,
      durationMs: r.trackTimeMillis ?? null,
      previewUrl: r.previewUrl?.trim() || null,
    }))
}

/** Tracks for one release; [] when it has no Apple Music link or the lookup fails. */
export async function getPreviewTracks(appleMusicUrl: string | null | undefined): Promise<PreviewTrack[]> {
  const c = appleCollection(appleMusicUrl)
  if (!c) return []
  try {
    const tracks = await lookup(c.id, c.country)
    // Some storefronts withhold clips; the US store almost always has them.
    if (c.country !== 'us' && tracks.length > 0 && tracks.every((t) => !t.previewUrl)) {
      const us = await lookup(c.id, 'us')
      if (us.some((t) => t.previewUrl)) return us
    }
    return tracks
  } catch {
    return []
  }
}

export async function toPreviewRelease(r: {
  id: string
  title: string
  coverImage: string | null
  appleMusicUrl: string | null
}): Promise<PreviewRelease> {
  return { id: r.id, title: r.title, coverImage: r.coverImage, tracks: await getPreviewTracks(r.appleMusicUrl) }
}

export const hasPreview = (r: PreviewRelease | null | undefined) => Boolean(r?.tracks.some((t) => t.previewUrl))
