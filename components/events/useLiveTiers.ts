'use client'

import { useEffect, useState } from 'react'
import type { LiveAvailability } from '@/app/api/events/[id]/availability/route'

type LiveTier = { id: string; state: LiveAvailability['tiers'][number]['state']; remaining: number | null }

/**
 * Event pages are cached for a minute, so their seat counts can be slightly old. This swaps in
 * the live state on load, when the tab comes back into view, and when a tier opens or closes.
 */
export function useLiveTiers<T extends LiveTier>(eventId: string, initial: T[]): T[] {
  const [live, setLive] = useState<LiveAvailability | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    async function refresh() {
      try {
        const res = await fetch(`/api/events/${eventId}/availability`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as LiveAvailability
        if (cancelled) return
        setLive(data)
        window.clearTimeout(timer)
        if (data.refreshAt) {
          // Spread the "sales just opened" refresh over a few seconds instead of everyone at once.
          const wait = new Date(data.refreshAt).getTime() - Date.now() + 500 + Math.random() * 4_000
          if (wait < 2 ** 31 - 1) timer = window.setTimeout(refresh, Math.max(0, wait))
        }
      } catch {
        // Offline or busy: keep showing what the page was rendered with.
      }
    }
    const onVisible = () => document.visibilityState === 'visible' && refresh()

    refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [eventId])

  if (!live) return initial
  const byId = new Map(live.tiers.map((t) => [t.id, t]))
  return initial.map((t) => {
    const l = byId.get(t.id)
    return l ? { ...t, state: l.state, remaining: l.remaining } : t
  })
}
