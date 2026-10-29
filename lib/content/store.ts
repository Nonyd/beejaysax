import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { CONTENT, type ContentKey, type ContentOf, type Field, type ScalarField } from '@/lib/content/registry'

export class ContentError extends Error {}

/** Must match images.remotePatterns in next.config.ts */
const IMAGE_HOSTS = ['images.unsplash.com', 'img.youtube.com', 'i.ytimg.com', 'i.scdn.co']

function cleanScalar(f: ScalarField, v: unknown, strict: boolean): unknown {
  switch (f.type) {
    case 'text':
    case 'textarea': {
      if (typeof v !== 'string') return undefined
      const s = f.type === 'text' ? v.replace(/\s+/g, ' ').trim() : v.replace(/\r\n/g, '\n').trim()
      if (strict && f.max && s.length > f.max) throw new ContentError(`“${f.label}” is too long (max ${f.max} characters).`)
      return s.slice(0, f.max ?? 5000)
    }
    case 'lines': {
      if (!Array.isArray(v)) return undefined
      const arr = v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
      if (strict && f.maxItems && arr.length > f.maxItems) throw new ContentError(`“${f.label}” can have at most ${f.maxItems} lines.`)
      return arr.slice(0, f.maxItems ?? 10).map((x) => x.slice(0, 120))
    }
    case 'image':
    case 'url': {
      if (typeof v !== 'string') return undefined
      const s = v.trim()
      if (s && !/^https:\/\//i.test(s) && !(f.type === 'image' && s.startsWith('/'))) {
        if (strict) throw new ContentError(`“${f.label}” must be a full link starting with https://`)
        return undefined
      }
      // next/image only loads approved hosts (next.config.ts); anything else would break the page.
      if (f.type === 'image' && s.startsWith('https://')) {
        const host = new URL(s).hostname
        if (!IMAGE_HOSTS.includes(host)) {
          if (strict) throw new ContentError(`“${f.label}”: photos from ${host} can’t be shown. Upload the photo instead.`)
          return undefined
        }
      }
      return s
    }
  }
}

/** Validates one field. `strict` (saving) throws readable errors; reading silently falls back to defaults. */
function cleanField(f: Field, v: unknown, strict: boolean): unknown {
  if (f.type !== 'list') return cleanScalar(f, v, strict)
  if (!Array.isArray(v)) return undefined
  if (strict && f.maxItems && v.length > f.maxItems) throw new ContentError(`“${f.label}” can have at most ${f.maxItems} items.`)
  return v.slice(0, f.maxItems ?? 30).flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const out: Record<string, unknown> = {}
    for (const [k, sub] of Object.entries(f.item)) {
      const c = cleanScalar(sub, (row as Record<string, unknown>)[k], strict)
      out[k] = c === undefined ? sub.default : c
    }
    // Drop rows the admin left completely empty.
    return Object.values(out).some((x) => (Array.isArray(x) ? x.length : String(x ?? '').trim())) ? [out] : []
  })
}

function merge<K extends ContentKey>(key: K, stored: unknown): ContentOf<K> {
  const fields = CONTENT[key].fields as Record<string, Field>
  const data = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [name, f] of Object.entries(fields)) {
    const c = name in data ? cleanField(f, data[name], false) : undefined
    // Emptied text/lines/images fall back to the original so a page never shows a blank heading.
    // Lists may be emptied on purpose (e.g. no testimonials).
    const empty = c === undefined || (f.type !== 'list' && (c === '' || (Array.isArray(c) && c.length === 0)))
    out[name] = empty ? f.default : c
  }
  return out as ContentOf<K>
}

const loadAll = cache(async () => {
  try {
    const rows = await prisma.siteContent.findMany()
    return new Map(rows.map((r) => [r.key, r.data]))
  } catch {
    return new Map<string, unknown>()
  }
})

/** Content for a section: saved values over defaults. Read once per request. */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentOf<K>> {
  return merge(key, (await loadAll()).get(key))
}

/** Validates and saves a section. Unknown fields are ignored; bad values raise ContentError. */
export async function saveContent(key: ContentKey, values: unknown, by?: string) {
  if (!(key in CONTENT)) throw new ContentError('Unknown section.')
  const fields = CONTENT[key].fields as Record<string, Field>
  const v = (values && typeof values === 'object' ? values : {}) as Record<string, unknown>
  // Merge: fields not sent keep their saved value.
  const existing = await prisma.siteContent.findUnique({ where: { key } })
  const data: Record<string, unknown> = { ...((existing?.data as Record<string, unknown> | null) ?? {}) }
  for (const [name, f] of Object.entries(fields)) {
    if (!(name in v)) continue
    const c = cleanField(f, v[name], true)
    if (c !== undefined) data[name] = c
  }
  await prisma.siteContent.upsert({
    where: { key },
    create: { key, data: data as object, updatedBy: by },
    update: { data: data as object, updatedBy: by },
  })
  return merge(key, data)
}

export async function resetContent(key: ContentKey) {
  await prisma.siteContent.deleteMany({ where: { key } })
  return merge(key, {})
}

/** For the admin list: when each section was last edited. */
export async function contentEditTimes() {
  try {
    const rows = await prisma.siteContent.findMany({ select: { key: true, updatedAt: true, updatedBy: true } })
    return new Map(rows.map((r) => [r.key, r]))
  } catch {
    return new Map<string, { key: string; updatedAt: Date; updatedBy: string | null }>()
  }
}

/** Splits a textarea into paragraphs on blank lines. */
export const paragraphs = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
