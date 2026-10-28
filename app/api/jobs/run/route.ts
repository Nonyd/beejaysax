import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import { safeEqual } from '@/lib/secret-box'
import { expireStaleOrders } from '@/lib/events/orders'
import { retryQueuedEmails } from '@/lib/email/send'
import { markPastEvents, sendDueReminders } from '@/lib/jobs/reminders'
import { runScheduledSync } from '@/lib/sync/run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Scheduled jobs. Call every 15 minutes from the server crontab:
 *   curl -fsS -H "Authorization: Bearer <token>" https://beejaysax.com/api/jobs/run
 * (?token=<token> also works for cron services that can't set headers.)
 */
async function run(req: NextRequest) {
  const expected = await getSetting('jobs.token')
  if (!expected) return NextResponse.json({ error: 'Jobs token not configured (Admin → Settings → Scheduled jobs).' }, { status: 503 })
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? req.nextUrl.searchParams.get('token') ?? ''
  if (!safeEqual(given, expected)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const started = Date.now()
  const results: Record<string, unknown> = {}
  const task = async (name: string, fn: () => Promise<unknown>) => {
    try {
      results[name] = await fn()
    } catch (e) {
      console.error(`[jobs] ${name} failed`, e)
      results[name] = { error: e instanceof Error ? e.message : String(e) }
    }
  }

  await task('expiredOrders', () => expireStaleOrders())
  await task('emailRetries', () => retryQueuedEmails())
  await task('reminders', () => sendDueReminders())
  await task('pastEvents', async () => {
    const n = await markPastEvents()
    if (n) revalidatePath('/events')
    return n
  })
  await task('musicSync', () => runScheduledSync())

  const summary = { ok: true, ms: Date.now() - started, results }
  await prisma.siteSetting.upsert({
    where: { key: 'status.jobs.lastRun' },
    create: { key: 'status.jobs.lastRun', value: JSON.stringify({ at: new Date().toISOString(), results }) },
    update: { value: JSON.stringify({ at: new Date().toISOString(), results }) },
  })
  return NextResponse.json(summary)
}

export const GET = run
export const POST = run
