import { NextRequest, NextResponse } from 'next/server'
import { getTierAvailability } from '@/lib/events/availability'

type Params = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

/** One answer per event is reused this long, so a rush of buyers costs a few queries, not thousands. */
const TTL_MS = 3_000

export type LiveAvailability = {
  salesClosed: boolean
  tiers: { id: string; state: 'on_sale' | 'not_started' | 'ended' | 'sold_out'; remaining: number | null }[]
  /** Next time a tier opens or closes; the page asks again then. */
  refreshAt: string | null
}

// Holds the in-flight lookup too, so when the answer expires mid-rush only one request queries
// the database and the rest wait for it.
const store = globalThis as unknown as { __availability?: Map<string, { at: number; body: Promise<LiveAvailability | null> }> }
const memo = (store.__availability ??= new Map())

async function load(id: string): Promise<LiveAvailability | null> {
  const now = new Date()
  const avail = await getTierAvailability(id, now)
  if (!avail || avail.event.status === 'DRAFT') return null
  const upcoming = avail.tiers
    .flatMap((t) => [t.saleStartsAt, t.saleEndsAt])
    .filter((d): d is Date => d != null && d > now)
    .sort((a, b) => a.getTime() - b.getTime())
  return {
    salesClosed: avail.salesClosed,
    tiers: avail.tiers.map((t) => ({ id: t.id, state: t.state, remaining: t.remaining })),
    refreshAt: upcoming[0]?.toISOString() ?? null,
  }
}

/**
 * Live seat counts and on-sale state for an event. The event pages themselves are cached,
 * so they read this from the browser to show what's left right now.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const hit = memo.get(id)
  let pending = hit && Date.now() - hit.at < TTL_MS ? hit.body : undefined
  if (!pending) {
    pending = load(id)
    if (memo.size > 200) memo.clear()
    const entry = { at: Date.now(), body: pending }
    memo.set(id, entry)
    // A failed lookup isn't reused; the next request tries again.
    pending.catch(() => memo.get(id) === entry && memo.delete(id))
  }
  const body = await pending
  if (!body) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
}
