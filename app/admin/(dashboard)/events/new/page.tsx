import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EventEditor from '@/components/admin/events/EventEditor'
import { BLANK_EVENT } from '@/lib/events/editor-data'

export default async function NewEventPage() {
  await requireAdmin('events')
  return (
    <div>
      <nav className="mb-8 text-[13px]">
        <Link href="/admin/events" className="text-[rgba(247,241,227,0.65)] no-underline">Events</Link>
        <span className="mx-2 text-[rgba(247,241,227,0.35)]">/</span>
        <span className="text-[#E3B23C]">New event</span>
      </nav>
      <AdminPageHeader
        eyebrow="Events"
        title="New event"
        subtitle="Fill in the details and ticket types. Save it as a draft until you’re ready to sell tickets."
      />
      <EventEditor initial={BLANK_EVENT} />
    </div>
  )
}
