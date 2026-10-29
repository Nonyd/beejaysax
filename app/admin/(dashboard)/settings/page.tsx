import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SettingsClient from '@/components/admin/SettingsClient'
import { requireAdmin } from '@/lib/admin-auth'
import { SETTING_GROUPS, getSettingsForAdmin } from '@/lib/settings'
import { prisma } from '@/lib/prisma'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdmin('settings')
  const settings = await getSettingsForAdmin()
  const lastRunRow = await prisma.siteSetting.findUnique({ where: { key: 'status.jobs.lastRun' } })
  const lastRun = lastRunRow ? (JSON.parse(lastRunRow.value) as { at: string }).at : null
  const stale = !lastRun || Date.now() - new Date(lastRun).getTime() > 60 * 60_000
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')

  return (
    <div>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Payment, email and music-sync credentials. Secret keys are encrypted and never shown in full after saving."
      />
      <p className={`mx-auto mb-6 max-w-[860px] rounded-[14px] border px-4 py-3 text-[14px] ${stale ? 'border-[#f0a35e]/40 text-[#f0a35e]' : 'border-[#4ade80]/30 text-[#4ade80]'}`}>
        {lastRun
          ? `Scheduled jobs last ran ${fmt(new Date(lastRun), 'd MMM yyyy, HH:mm')}${stale ? '. That was over an hour ago: check the server crontab.' : '.'}`
          : 'Scheduled jobs have never run. Reminders and email retries need the crontab described under Scheduled jobs.'}
      </p>
      <SettingsClient initial={settings} groups={SETTING_GROUPS} siteUrl={siteUrl} />
    </div>
  )
}
