import { requireAdmin } from '@/lib/admin-auth'
import ReleaseForm from '@/components/admin/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default async function NewReleasePage() {
  await requireAdmin('releases')
  return (
    <div>
      <AdminPageHeader
        eyebrow="Releases"
        title="New release"
        subtitle="Add a single, album, or EP — streaming links and cover art."
      />
      <ReleaseForm mode="create" />
    </div>
  )
}
