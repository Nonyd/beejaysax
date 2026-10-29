// Server-only. Maintenance mode is stored in SiteSetting under `maintenance.state` (JSON).
import { prisma } from '@/lib/prisma'

export type MaintenanceState = {
  enabled: boolean
  /** Shown on the maintenance page; a default is used when empty */
  message: string
  /** Free text such as "Back by 6pm" */
  until: string
  updatedBy?: string
  updatedAt?: string
}

const KEY = 'maintenance.state'
const TTL_MS = 5_000
export const DEFAULT_MAINTENANCE_MESSAGE = 'We are making a few improvements to the site. Please check back shortly.'

const OFF: MaintenanceState = { enabled: false, message: '', until: '' }

// The proxy and the app are bundled separately but run in one Node process, so the cache lives
// on globalThis: clearing it after a change takes effect everywhere at once in that process.
// Other processes (if the host runs several) pick it up within TTL_MS.
const store = globalThis as unknown as { __maintenance?: { at: number; value: MaintenanceState } }

export async function getMaintenance(): Promise<MaintenanceState> {
  const hit = store.__maintenance
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value
  let value = OFF
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } })
    if (row) value = { ...OFF, ...(JSON.parse(row.value) as Partial<MaintenanceState>) }
  } catch (e) {
    // Database down: keep serving the last known state rather than flipping the site
    console.error('[maintenance] read failed', e)
    if (hit) return hit.value
  }
  store.__maintenance = { at: Date.now(), value }
  return value
}

export async function setMaintenance(input: { enabled: boolean; message: string; until: string }, adminName: string) {
  const value: MaintenanceState = {
    enabled: input.enabled,
    message: input.message.trim().slice(0, 1000),
    until: input.until.trim().slice(0, 120),
    updatedBy: adminName,
    updatedAt: new Date().toISOString(),
  }
  const json = JSON.stringify(value)
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: json, updatedBy: adminName },
    update: { value: json, updatedBy: adminName },
  })
  store.__maintenance = { at: Date.now(), value }
  return value
}

/**
 * Paths that keep working during maintenance: the admin, sign-in, payment and email webhooks,
 * scheduled jobs, health checks, attendees' tickets, door check-in (an event may be on) and unsubscribe links.
 */
const ALWAYS_OPEN = [
  '/admin',
  '/maintenance',
  '/api/auth',
  '/api/admin',
  '/api/webhooks',
  '/api/jobs',
  '/api/health',
  '/api/upload',
  '/api/tickets',
  '/tickets',
  '/checkin',
  '/api/checkin',
  '/uploads',
  // Unsubscribe links in campaign emails (and Gmail/Yahoo one-click unsubscribe) must always work.
  '/unsubscribe',
  '/api/mailing/unsubscribe',
]

export function isOpenDuringMaintenance(pathname: string) {
  return ALWAYS_OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
