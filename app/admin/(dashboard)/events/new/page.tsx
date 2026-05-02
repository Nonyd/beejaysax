import EventForm from '@/components/admin/EventForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function NewEventPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Events"
        title="New event"
        subtitle="Add a concert or appearance — set date, venue, ticket tiers, and poster art."
      />
      <EventForm mode="create" />
    </div>
  )
}
