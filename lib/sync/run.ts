import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { syncSpotify } from '@/lib/sync/spotify'
import { syncYouTube } from '@/lib/sync/youtube'

export type SyncSource = 'spotify' | 'youtube'
export type SyncStatus = { at: string; ok: boolean; note: string }

const KEY = (s: SyncSource) => `status.sync.${s}`

export async function getSyncStatus(source: SyncSource): Promise<SyncStatus | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY(source) } })
  try {
    return row ? (JSON.parse(row.value) as SyncStatus) : null
  } catch {
    return null
  }
}

/** Runs one sync, records a plain-language note for the admin, refreshes public pages. */
export async function runSync(source: SyncSource): Promise<SyncStatus> {
  let status: SyncStatus
  try {
    if (source === 'spotify') {
      const r = await syncSpotify()
      const parts = [`${r.found} releases on Spotify`, `${r.created} new`, `${r.updated} updated`]
      if (r.linked) parts.push(`${r.linked} existing linked`)
      status = {
        at: new Date().toISOString(),
        ok: r.errors.length === 0,
        note: parts.join(', ') + (r.errors.length ? `. Problems: ${r.errors.slice(0, 3).join('; ')}` : ''),
      }
      revalidatePath('/releases')
    } else {
      const r = await syncYouTube()
      status = {
        at: new Date().toISOString(),
        ok: true,
        note: `${r.found} uploads checked, ${r.created} new, ${r.updated} updated${r.skippedShorts ? `, ${r.skippedShorts} Shorts skipped` : ''}${r.hiddenRemoved ? `, ${r.hiddenRemoved} removed from YouTube hidden` : ''}`,
      }
    }
    revalidatePath('/')
  } catch (e) {
    status = { at: new Date().toISOString(), ok: false, note: e instanceof Error ? e.message : 'Sync failed' }
  }
  await prisma.siteSetting.upsert({
    where: { key: KEY(source) },
    create: { key: KEY(source), value: JSON.stringify(status) },
    update: { value: JSON.stringify(status) },
  })
  return status
}

/** Called by the jobs endpoint: once a day when "Daily automatic sync" is on. */
export async function runScheduledSync() {
  if ((await getSetting('sync.enabled')) !== 'on') return 'off'
  const out: Record<string, string> = {}
  for (const s of ['spotify', 'youtube'] as SyncSource[]) {
    const last = await getSyncStatus(s)
    if (last && Date.now() - new Date(last.at).getTime() < 20 * 3600_000) {
      out[s] = 'not due'
      continue
    }
    out[s] = (await runSync(s)).note
  }
  return out
}
