import slugify from 'slugify'
import type { ReleaseType } from '@prisma/client'

export class ReleaseInputError extends Error {}

/** Fields an admin may set; anything else in the request is ignored. */
const SYNCABLE = ['title', 'releaseType', 'releaseDate', 'coverImage', 'spotifyUrl', 'appleMusicUrl'] as const

export function parseReleaseInput(b: Record<string, unknown>, partial = false) {
  const str = (v: unknown, max = 1000) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
  const url = (v: unknown, label: string) => {
    const s = str(v)
    if (s && !/^https?:\/\//i.test(s)) throw new ReleaseInputError(`${label} must be a full link starting with https://`)
    return s
  }
  const data: Record<string, unknown> = {}
  const has = (k: string) => k in b
  if (!partial || has('title')) {
    const title = str(b.title, 200)
    if (!title) throw new ReleaseInputError('Add a title.')
    data.title = title
  }
  if (!partial || has('slug')) data.slug = slugify(str(b.slug, 120) ?? String(data.title ?? ''), { lower: true, strict: true }) || undefined
  if (!partial || has('releaseType')) {
    const t = String(b.releaseType ?? 'SINGLE')
    data.releaseType = (['SINGLE', 'ALBUM', 'EP'].includes(t) ? t : 'SINGLE') as ReleaseType
  }
  if (has('description')) data.description = str(b.description, 3000)
  if (has('coverImage')) data.coverImage = url(b.coverImage, 'Cover image')
  for (const [k, label] of [
    ['spotifyUrl', 'Spotify link'],
    ['appleMusicUrl', 'Apple Music link'],
    ['youtubeUrl', 'YouTube link'],
    ['audiomackUrl', 'Audiomack link'],
    ['boomplayUrl', 'Boomplay link'],
  ] as const) {
    if (has(k)) data[k] = url(b[k], label)
  }
  if (has('releaseDate')) {
    const d = b.releaseDate ? new Date(String(b.releaseDate)) : null
    if (d && Number.isNaN(d.getTime())) throw new ReleaseInputError('Release date is not valid.')
    data.releaseDate = d
  }
  if (has('isFeatured')) data.isFeatured = b.isFeatured === true
  if (has('isHidden')) data.isHidden = b.isHidden === true
  return data
}

/** Which synced fields this edit changed, so the next Spotify sync leaves them alone. */
export function newlyLocked(current: Record<string, unknown>, data: Record<string, unknown>) {
  const same = (a: unknown, b: unknown) =>
    (a instanceof Date ? a.toISOString().slice(0, 10) : a ?? null) === (b instanceof Date ? b.toISOString().slice(0, 10) : b ?? null)
  return SYNCABLE.filter((f) => f in data && !same(current[f], data[f]))
}
