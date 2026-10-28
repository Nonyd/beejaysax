import slugify from 'slugify'
import type { ReleaseType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { parseSpotifyArtistId } from '@/lib/music-ids'

type SpotifyAlbum = {
  id: string
  name: string
  album_type: 'album' | 'single' | 'compilation'
  total_tracks: number
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  images: { url: string; width: number; height: number }[]
  external_urls: { spotify: string }
}

let tokenCache: { value: string; exp: number; key: string } | null = null

async function token(clientId: string, secret: string) {
  if (tokenCache && tokenCache.key === clientId && tokenCache.exp > Date.now() + 60_000) return tokenCache.value
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15_000),
  })
  const d = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string }
  if (!res.ok || !d.access_token) throw new Error(d.error_description ?? 'Spotify rejected the client ID/secret')
  tokenCache = { value: d.access_token, exp: Date.now() + (d.expires_in ?? 3600) * 1000, key: clientId }
  return d.access_token
}

async function api<T>(tok: string, url: string): Promise<T> {
  const res = await fetch(url.startsWith('http') ? url : `https://api.spotify.com/v1${url}`, {
    headers: { Authorization: `Bearer ${tok}` },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Spotify ${res.status} for ${url.replace(/\?.*/, '')}`)
  return (await res.json()) as T
}

/** Lowercase, drop "(feat. …)", " - Single", punctuation: for matching titles across services. */
export function normalizeTitle(s: string) {
  return s
    .toLowerCase()
    .replace(/\s*[([]\s*(feat\.?|ft\.?|featuring|with)\b[^)\]]*[)\]]/g, '')
    .replace(/\s+-\s+(single|ep)$/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(a: SpotifyAlbum): Date {
  const [y, m = '01', d = '01'] = a.release_date.split('-')
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12))
}

function releaseType(a: SpotifyAlbum): ReleaseType {
  if (a.album_type === 'album' || a.album_type === 'compilation') return 'ALBUM'
  return a.total_tracks >= 4 ? 'EP' : 'SINGLE'
}

/** Apple Music link via the free iTunes Search API, matched by normalised title. */
export async function findAppleMusicUrl(artist: string, title: string): Promise<string | null> {
  try {
    const q = new URLSearchParams({ term: `${artist} ${title}`, entity: 'album', country: 'NG', limit: '10' })
    const res = await fetch(`https://itunes.apple.com/search?${q}`, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const d = (await res.json()) as { results?: { collectionName: string; artistName: string; collectionViewUrl: string }[] }
    const want = normalizeTitle(title)
    const artistN = normalizeTitle(artist)
    const hit = d.results?.find((r) => normalizeTitle(r.collectionName) === want && normalizeTitle(r.artistName).includes(artistN))
    return hit?.collectionViewUrl.replace(/\?.*$/, '') ?? null
  } catch {
    return null
  }
}

async function uniqueSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true }) || 'release'
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`
    if (!(await prisma.release.findUnique({ where: { slug } }))) return slug
  }
}

const locked = (fields: string[], f: string) => fields.includes(f)

/**
 * Imports the artist's albums and singles from Spotify.
 * - New Spotify releases are created; an existing hand-made release with the same title is linked instead of duplicated.
 * - Fields an admin edited by hand (lockedFields) are never overwritten.
 * - One failing album doesn't stop the rest.
 */
export async function syncSpotify() {
  const [clientId, secret, artistRaw] = await Promise.all([
    getSetting('spotify.clientId'),
    getSetting('spotify.clientSecret'),
    getSetting('spotify.artistId'),
  ])
  const artistId = parseSpotifyArtistId(artistRaw)
  if (!clientId || !secret || !artistId) throw new Error('Spotify isn’t set up: add the client ID, secret and artist link in Settings.')

  const tok = await token(clientId, secret)
  const artist = await api<{ name: string }>(tok, `/artists/${artistId}`)
  const albums: SpotifyAlbum[] = []
  // Spotify currently rejects limit > 10 on this endpoint, so page through.
  let next: string | null = `/artists/${artistId}/albums?include_groups=album,single&market=NG&limit=10`
  while (next && albums.length < 300) {
    const page: { items: SpotifyAlbum[]; next: string | null } = await api(tok, next)
    albums.push(...page.items)
    next = page.next
  }
  const unique = [...new Map(albums.map((a) => [a.id, a])).values()]

  let created = 0
  let updated = 0
  let linked = 0
  const errors: string[] = []
  const manual = await prisma.release.findMany({ where: { spotifyAlbumId: null }, select: { id: true, title: true } })

  for (const a of unique) {
    try {
      const cover = [...a.images].sort((x, y) => (y.height ?? 0) - (x.height ?? 0))[0]?.url ?? null
      const existing =
        (await prisma.release.findFirst({ where: { spotifyAlbumId: a.id } })) ??
        (await (async () => {
          const m = manual.find((r) => normalizeTitle(r.title) === normalizeTitle(a.name))
          return m ? prisma.release.findUnique({ where: { id: m.id } }) : null
        })())

      if (!existing) {
        const apple = await findAppleMusicUrl(artist.name, a.name)
        await prisma.release.create({
          data: {
            title: a.name,
            slug: await uniqueSlug(a.name),
            releaseType: releaseType(a),
            releaseDate: parseDate(a),
            coverImage: cover,
            spotifyUrl: a.external_urls.spotify,
            appleMusicUrl: apple,
            spotifyAlbumId: a.id,
            lastSyncedAt: new Date(),
          },
        })
        created++
        continue
      }

      const L = existing.lockedFields
      const wasManual = !existing.spotifyAlbumId
      const data: Record<string, unknown> = { spotifyAlbumId: a.id, lastSyncedAt: new Date() }
      // A hand-made release being linked keeps everything it already has; only gaps are filled.
      const fill = (field: string, value: unknown, current: unknown) => {
        if (locked(L, field)) return
        if (wasManual && current) return
        if (value != null) data[field] = value
      }
      fill('title', a.name, existing.title)
      fill('releaseType', releaseType(a), wasManual ? existing.releaseType : null)
      fill('releaseDate', parseDate(a), existing.releaseDate)
      fill('coverImage', cover, existing.coverImage)
      fill('spotifyUrl', a.external_urls.spotify, existing.spotifyUrl)
      if (!existing.appleMusicUrl && !locked(L, 'appleMusicUrl')) {
        const apple = await findAppleMusicUrl(artist.name, existing.title || a.name)
        if (apple) data.appleMusicUrl = apple
      }
      await prisma.release.update({ where: { id: existing.id }, data })
      if (wasManual) linked++
      else updated++
    } catch (e) {
      errors.push(`${a.name}: ${e instanceof Error ? e.message : 'failed'}`)
    }
  }
  return { artist: artist.name, found: unique.length, created, updated, linked, errors }
}
