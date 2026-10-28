import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { getSettingsForAdmin, saveSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  return NextResponse.json({ settings: await getSettingsForAdmin() })
}

export async function PUT(req: NextRequest) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate

  const body = (await req.json().catch(() => null)) as { values?: Record<string, unknown>; clear?: unknown } | null
  if (!body || typeof body.values !== 'object' || body.values === null) {
    return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
  }
  const values: Record<string, string> = {}
  for (const [k, v] of Object.entries(body.values)) if (typeof v === 'string') values[k] = v
  const clear = Array.isArray(body.clear) ? body.clear.filter((k): k is string => typeof k === 'string') : []

  try {
    await saveSettings(values, clear, gate.user?.name ?? undefined)
  } catch (e) {
    console.error('[settings] save failed', e)
    return NextResponse.json({ error: 'Settings could not be saved. Try again.' }, { status: 500 })
  }
  return NextResponse.json({ settings: await getSettingsForAdmin() })
}
