import type { Prisma } from '@prisma/client'
import { CONTACT_STATUSES } from '@/lib/mailing/contacts'

/** Shared by the Mailing list page and its CSV export so both show the same people. */
export function contactFilter(f: { q: string; tag: string; status: string }): Prisma.ContactWhereInput {
  const q = f.q.trim()
  const status = CONTACT_STATUSES.find((s) => s === f.status.toUpperCase())
  return {
    ...(q ? { OR: [{ email: { contains: q.toLowerCase() } }, { name: { contains: q, mode: 'insensitive' } }] } : {}),
    ...(f.tag ? { tags: { has: f.tag } } : {}),
    ...(status ? { status } : {}),
  }
}
