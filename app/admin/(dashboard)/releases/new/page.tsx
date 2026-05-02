import ReleaseForm from '@/components/admin/ReleaseForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewReleasePage() {
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
