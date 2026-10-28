import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckinScanner from '@/components/checkin/CheckinScanner'

export const dynamic = 'force-dynamic'

export default async function AdminCheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true, title: true, checkInPinHash: true } })
  if (!event) notFound()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')

  return (
    <div>
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-[13px]">
        <Link href="/admin/events" className="text-[rgba(247,241,227,0.65)] no-underline">Events</Link>
        <span className="text-[rgba(247,241,227,0.35)]">/</span>
        <Link href={`/admin/events/${id}/tickets`} className="text-[rgba(247,241,227,0.65)] no-underline">{event.title}</Link>
        <span className="text-[rgba(247,241,227,0.35)]">/</span>
        <span className="text-[#E3B23C]">Check-in</span>
      </nav>
      <CheckinScanner eventId={event.id} eventTitle={event.title} />
      <p className="mx-auto mt-10 max-w-[520px] text-[14px] leading-relaxed text-[rgba(247,241,227,0.6)]">
        {event.checkInPinHash ? (
          <>
            Door volunteers can scan without an admin login at{' '}
            <code className="text-[#F7F1E3]">{siteUrl}/checkin/{event.id}</code> using the event’s check-in PIN.
          </>
        ) : (
          <>Set a check-in PIN on the event to let door volunteers scan without an admin login.</>
        )}
      </p>
    </div>
  )
}
