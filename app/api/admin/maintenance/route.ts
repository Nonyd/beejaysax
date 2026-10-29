import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { getMaintenance, setMaintenance } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gate = await requireAdminApi('maintenance')
  if (gate instanceof NextResponse) return gate
  return NextResponse.json({ maintenance: await getMaintenance() })
}

export async function PUT(req: NextRequest) {
  const gate = await requireAdminApi('maintenance')
  if (gate instanceof NextResponse) return gate

  const body = (await req.json().catch(() => null)) as { enabled?: unknown; message?: unknown; until?: unknown } | null
  if (!body || typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })

  try {
    const maintenance = await setMaintenance(
      { enabled: body.enabled, message: String(body.message ?? ''), until: String(body.until ?? '') },
      gate.username
    )
    return NextResponse.json({ maintenance })
  } catch (e) {
    console.error('[maintenance] save failed', e)
    return NextResponse.json({ error: 'Could not save. Try again.' }, { status: 500 })
  }
}
