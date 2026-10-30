import { randomBytes } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const CONTACT_STATUSES = ['SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED'] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

const EMAIL_RE = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i

/** Common misspellings of big mail providers, fixed on import. */
const DOMAIN_FIXES: Record<string, string> = {
  'gmail.con': 'gmail.com', 'gmail.comm': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com',
  'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gnail.com': 'gmail.com',
  'gmail.coom': 'gmail.com', 'gmsil.com': 'gmail.com', 'gimail.com': 'gmail.com',
  'yahoo.con': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.comm': 'yahoo.com', 'yhoo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmai.com': 'hotmail.com',
  'outlook.con': 'outlook.com', 'icloud.con': 'icloud.com',
}

/** Lower-cases, trims and fixes obvious domain typos. Returns null if it isn't an email address. */
export function cleanEmail(raw: unknown): { email: string; fixed: boolean } | null {
  const s = String(raw ?? '').trim().toLowerCase().replace(/^mailto:/, '').replace(/\s+/g, '')
  if (!EMAIL_RE.test(s)) return null
  const [local, domain] = [s.slice(0, s.lastIndexOf('@')), s.slice(s.lastIndexOf('@') + 1)]
  const fix = DOMAIN_FIXES[domain]
  return fix ? { email: `${local}@${fix}`, fixed: true } : { email: s, fixed: false }
}

export function cleanName(raw: unknown): string | null {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
  return s || null
}

export function cleanTags(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : String(raw ?? '').split(',')
  return [...new Set(list.map((t) => String(t).replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean))].slice(0, 10)
}

export const newContactToken = () => randomBytes(18).toString('base64url')

/**
 * Finds the email and name columns in spreadsheet rows. Works with or without a header row
 * ("Email", "Name", or "First name" + "Last name").
 */
export function rowsToPeople(rows: string[][]): { people: { email: string; name: string | null; fixed: boolean }[]; invalid: number } {
  const header = rows[0]?.map((h) => h.toLowerCase().trim()) ?? []
  const findHeader = (re: RegExp) => header.findIndex((h) => re.test(h))
  let emailCol = findHeader(/^e-?mail( address)?$/)
  let nameCols: number[] = []
  let body = rows
  if (emailCol >= 0) {
    body = rows.slice(1)
    const full = findHeader(/^(full )?name$/)
    const first = findHeader(/^first ?name$/)
    const last = findHeader(/^(last ?name|surname)$/)
    nameCols = full >= 0 ? [full] : [first, last].filter((i) => i >= 0)
  } else {
    // No header: the email column is the one where most cells are addresses; the name is the first other text column.
    const width = Math.max(0, ...rows.map((r) => r.length))
    const hits = Array.from({ length: width }, (_, i) => rows.filter((r) => cleanEmail(r[i])).length)
    emailCol = hits.indexOf(Math.max(0, ...hits))
    const nameCol = Array.from({ length: width }, (_, i) => i).find((i) => i !== emailCol && rows.some((r) => r[i] && !cleanEmail(r[i])))
    nameCols = nameCol === undefined ? [] : [nameCol]
  }
  if (emailCol < 0) throw new Error('Couldn’t find a column of email addresses.')

  const people: { email: string; name: string | null; fixed: boolean }[] = []
  let invalid = 0
  for (const r of body) {
    if (!r.some(Boolean)) continue
    const e = cleanEmail(r[emailCol])
    if (!e) {
      invalid++
      continue
    }
    people.push({ ...e, name: cleanName(nameCols.map((i) => r[i]).filter(Boolean).join(' ')) })
  }
  return { people, invalid }
}

export type ImportSummary = { rows: number; invalid: number; fixed: number; duplicatesInFile: number; added: number; alreadyOnList: number }

/**
 * Adds people to the mailing list as subscribed. Existing contacts keep their status (an unsubscribe is never
 * undone by an import); they only gain the new tags and, if missing, a name.
 */
export async function importPeople(
  input: { people: { email: string; name: string | null; fixed: boolean }[]; invalid: number },
  opts: { tags: string[]; source: 'IMPORT' | 'ADMIN' | 'SIGNUP'; dryRun?: boolean }
): Promise<ImportSummary> {
  const byEmail = new Map<string, { email: string; name: string | null }>()
  for (const p of input.people) if (!byEmail.has(p.email) || (!byEmail.get(p.email)!.name && p.name)) byEmail.set(p.email, p)
  const unique = [...byEmail.values()]
  const emails = unique.map((p) => p.email)

  const existing = new Set<string>()
  for (let i = 0; i < emails.length; i += 1000) {
    const found = await prisma.contact.findMany({ where: { email: { in: emails.slice(i, i + 1000) } }, select: { email: true } })
    found.forEach((c) => existing.add(c.email))
  }
  const fresh = unique.filter((p) => !existing.has(p.email))
  const summary: ImportSummary = {
    rows: input.people.length + input.invalid,
    invalid: input.invalid,
    fixed: input.people.filter((p) => p.fixed).length,
    duplicatesInFile: input.people.length - unique.length,
    added: fresh.length,
    alreadyOnList: existing.size,
  }
  if (opts.dryRun) return summary

  for (let i = 0; i < fresh.length; i += 500) {
    await prisma.contact.createMany({
      data: fresh.slice(i, i + 500).map((p) => ({ email: p.email, name: p.name, tags: opts.tags, source: opts.source, token: newContactToken() })),
      skipDuplicates: true,
    })
  }
  const old = unique.filter((p) => existing.has(p.email))
  for (let i = 0; i < old.length; i += 500) {
    const chunk = old.slice(i, i + 500)
    if (opts.tags.length) {
      await prisma.$executeRaw`
        UPDATE "Contact" SET tags = ARRAY(SELECT DISTINCT unnest(tags || ${opts.tags}::text[])), "updatedAt" = now()
        WHERE email = ANY(${chunk.map((p) => p.email)}::text[])`
    }
    const named = chunk.filter((p) => p.name)
    if (named.length) {
      await prisma.$executeRaw`
        UPDATE "Contact" c SET name = v.name FROM (SELECT unnest(${named.map((p) => p.email)}::text[]) AS email, unnest(${named.map((p) => p.name!)}::text[]) AS name) v
        WHERE c.email = v.email AND c.name IS NULL`
    }
  }
  return summary
}

/** Every tag in use, with how many subscribed contacts carry it. */
export async function tagCounts(): Promise<{ tag: string; subscribed: number; total: number }[]> {
  const rows = await prisma.$queryRaw<{ tag: string; subscribed: bigint; total: bigint }[]>`
    SELECT t AS tag, count(*) FILTER (WHERE status = 'SUBSCRIBED') AS subscribed, count(*) AS total
    FROM "Contact", unnest(tags) AS t GROUP BY t ORDER BY t`
  return rows.map((r) => ({ tag: r.tag, subscribed: Number(r.subscribed), total: Number(r.total) }))
}

/** Subscribed contacts a campaign to `tag` (or everyone) would reach, excluding blocked addresses. */
export function audienceWhere(tag: string | null): Prisma.ContactWhereInput {
  return { status: 'SUBSCRIBED', ...(tag ? { tags: { has: tag } } : {}) }
}

/** Public signup form. Never reveals whether the address was already on the list. */
export async function subscribeFromWebsite(email: string, name: string | null) {
  const existing = await prisma.contact.findUnique({ where: { email } })
  if (!existing) {
    await prisma.contact.create({ data: { email, name, source: 'SIGNUP', tags: ['Website signup'], token: newContactToken() } })
    return
  }
  // Status never changes here: anyone can type any address into the form, so an unsubscribe is only
  // undone through the resubscribe link in our emails. Bounced or spam-flagged addresses stay blocked.
  await prisma.contact.update({
    where: { email },
    data: {
      name: existing.name ?? name,
      tags: existing.tags.includes('Website signup') ? undefined : { push: 'Website signup' },
    },
  })
}

export async function setContactStatusByToken(token: string, status: 'SUBSCRIBED' | 'UNSUBSCRIBED') {
  const c = await prisma.contact.findUnique({ where: { token } })
  if (!c) return null
  // Bounced/spam-flagged contacts can unsubscribe but not resubscribe themselves.
  if (status === 'SUBSCRIBED' && c.status !== 'UNSUBSCRIBED') return c
  return prisma.contact.update({
    where: { token },
    data: { status, unsubscribedAt: status === 'UNSUBSCRIBED' ? new Date() : null },
  })
}

/** Called from delivery webhooks so bounced or spam-flagged addresses leave the mailing list too. */
export async function markContactUndeliverable(email: string, reason: 'BOUNCED' | 'COMPLAINED') {
  await prisma.contact.updateMany({ where: { email, status: { not: 'COMPLAINED' } }, data: { status: reason } })
}
