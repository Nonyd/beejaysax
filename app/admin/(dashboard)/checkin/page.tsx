import Link from 'next/link'
import { subDays } from 'date-fns'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { fmt } from '@/lib/time'
import AdminPageHeader, { adminPrimaryLinkStyle } from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

/** Entry point for door staff: pick an event, open its scanner. */
export default async function AdminCheckinListPage() {
  await requireAdmin('checkin')
  const events = await prisma.event.findMany({
    where: { status: { in: ['UPCOMING', 'PAST'] }, eventDate: { gte: subDays(new Date(), 2) } },
    orderBy: { eventDate: 'asc' },
    select: { id: true, title: true, venue: true, city: true, eventDate: true },
  })

  return (
    <div>
      <AdminPageHeader eyebrow="At the door" title="Door check-in" subtitle="Choose an event to open its ticket scanner." />
      {events.length === 0 ? (
        <p className="text-[15px] text-[rgba(247,241,227,0.6)]">No events today or coming up.</p>
      ) : (
        <ul className="divide-y divide-[rgba(247,241,227,0.12)] border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B]">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="min-w-0">
                <p className="text-[16px] text-[#F7F1E3]">{e.title}</p>
                <p className="mt-1 text-[13px] text-[rgba(247,241,227,0.6)]">
                  {fmt(e.eventDate, 'EEE d MMM yyyy, HH:mm')} · {e.venue}, {e.city}
                </p>
              </div>
              <Link href={`/admin/events/${e.id}/checkin`} style={adminPrimaryLinkStyle()}>
                Open scanner
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
