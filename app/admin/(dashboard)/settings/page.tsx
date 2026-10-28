import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SettingsClient from '@/components/admin/SettingsClient'
import { requireAdmin } from '@/lib/admin-auth'
import { SETTING_GROUPS, getSettingsForAdmin } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const settings = await getSettingsForAdmin()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')

  return (
    <div>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Payment, email and music-sync credentials. Secret keys are encrypted and never shown in full after saving."
      />
      <SettingsClient initial={settings} groups={SETTING_GROUPS} siteUrl={siteUrl} />
    </div>
  )
}
