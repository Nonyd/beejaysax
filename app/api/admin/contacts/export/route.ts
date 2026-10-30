import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { contactFilter } from '@/lib/mailing/filter'

export const runtime = 'nodejs'

/** Quotes every cell and neutralises spreadsheet formulas (names come from the public signup form). */
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`

/** CSV of the contacts matching the list's current filters (same query string as the admin page). */
export async function GET(req: NextRequest) {
  const gate = await requireAdminApi('mailing')
  if (gate instanceof NextResponse) return gate
  const p = req.nextUrl.searchParams
  const contacts = await prisma.contact.findMany({
    where: contactFilter({ q: p.get('q') ?? '', tag: p.get('tag') ?? '', status: p.get('status') ?? '' }),
    orderBy: { createdAt: 'asc' },
  })
  const lines = [
    'Email,Name,Status,Tags,Source,Added',
    ...contacts.map((c) => [c.email, c.name ?? '', c.status.toLowerCase(), c.tags.join('; '), c.source.toLowerCase(), c.createdAt.toISOString().slice(0, 10)].map(cell).join(',')),
  ]
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="beejaysax-mailing-list-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
