import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MaintenanceClient from '@/components/admin/MaintenanceClient'
import { requireAdmin } from '@/lib/admin-auth'
import { DEFAULT_MAINTENANCE_MESSAGE, getMaintenance } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

export default async function AdminMaintenancePage() {
  await requireAdmin('maintenance')
  return (
    <div>
      <AdminPageHeader
        eyebrow="Site status"
        title="Maintenance mode"
        subtitle="Take the public website offline while you make changes, and bring it back with one click."
      />
      <MaintenanceClient initial={await getMaintenance()} defaultMessage={DEFAULT_MAINTENANCE_MESSAGE} />
    </div>
  )
}
