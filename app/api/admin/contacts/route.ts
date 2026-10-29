import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { readSheet } from '@/lib/mailing/sheet'
import { cleanEmail, cleanName, cleanTags, CONTACT_STATUSES, importPeople, newContactToken, rowsToPeople } from '@/lib/mailing/contacts'

export const runtime = 'nodejs'
export const maxDuration = 120

const MAX_FILE = 5 * 1024 * 1024
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

/**
 * Mailing list admin.
 *   multipart { file, tags, dryRun }      import an Excel/CSV file (dryRun=1 only reports what would happen)
 *   { action: 'add', email, name, tags }
 *   { action: 'update', id, name?, tags?, status? }
 *   { action: 'delete', id }
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate

  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) return bad('Choose a file to import.')
    if (file.size > MAX_FILE) return bad('That file is over 5MB. Split it into smaller files.')
    try {
      const rows = readSheet(new Uint8Array(await file.arrayBuffer()), file.name)
      const parsed = rowsToPeople(rows)
      if (!parsed.people.length) return bad('No email addresses found in that file.')
      const summary = await importPeople(parsed, { tags: cleanTags(form.get('tags')), source: 'IMPORT', dryRun: form.get('dryRun') === '1' })
      return NextResponse.json({ ok: true, summary })
    } catch (e) {
      return bad(e instanceof Error ? e.message : 'Couldn’t read that file.')
    }
  }

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  if (b.action === 'add') {
    const e = cleanEmail(b.email)
    if (!e) return bad('Enter a valid email address.')
    const tags = cleanTags(b.tags)
    const existing = await prisma.contact.findUnique({ where: { email: e.email } })
    if (existing) return bad(`${e.email} is already on the list.`)
    await prisma.contact.create({ data: { email: e.email, name: cleanName(b.name), tags, source: 'ADMIN', token: newContactToken() } })
    return NextResponse.json({ ok: true, fixed: e.fixed ? e.email : undefined })
  }
  if (b.action === 'update' && typeof b.id === 'string') {
    const status = CONTACT_STATUSES.find((s) => s === b.status)
    const c = await prisma.contact.findUnique({ where: { id: b.id } })
    if (!c) return bad('Contact not found.', 404)
    if (status === 'SUBSCRIBED' && c.status !== 'SUBSCRIBED' && c.status !== 'UNSUBSCRIBED') {
      return bad('This address bounced or reported spam, so it can’t be resubscribed.')
    }
    await prisma.contact.update({
      where: { id: b.id },
      data: {
        ...(b.name !== undefined ? { name: cleanName(b.name) } : {}),
        ...(b.tags !== undefined ? { tags: cleanTags(b.tags) } : {}),
        ...(status ? { status, unsubscribedAt: status === 'UNSUBSCRIBED' ? new Date() : null } : {}),
      },
    })
    return NextResponse.json({ ok: true })
  }
  if (b.action === 'delete' && typeof b.id === 'string') {
    await prisma.contact.deleteMany({ where: { id: b.id } })
    return NextResponse.json({ ok: true })
  }
  return bad('Unknown action.')
}
