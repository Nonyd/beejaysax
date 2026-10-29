import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { runSync, type SyncSource } from '@/lib/sync/run'

export const runtime = 'nodejs'
export const maxDuration = 300

/** "Sync now" buttons in the admin. */
export async function POST(_req: Request, { params }: { params: Promise<{ source: string }> }) {
  const { source } = await params
  if (source !== 'spotify' && source !== 'youtube') return NextResponse.json({ error: 'Unknown source.' }, { status: 404 })
  const gate = await requireAdminApi(source === 'spotify' ? 'releases' : 'videos')
  if (gate instanceof NextResponse) return gate
  const status = await runSync(source as SyncSource)
  return NextResponse.json(status, { status: status.ok ? 200 : 502 })
}
