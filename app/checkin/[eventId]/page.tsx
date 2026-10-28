import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkinActor } from '@/lib/events/checkin'
import CheckinScanner from '@/components/checkin/CheckinScanner'
import PinGate from '@/components/checkin/PinGate'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Door check-in', robots: { index: false, follow: false } }

/** Volunteer door scanner: unlocked with the event's check-in PIN, no admin account needed. */
export default async function VolunteerCheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, title: true, checkInPinHash: true } })
  if (!event) notFound()
  const allowed = await checkinActor(event.id)

  return (
    <main className="min-h-screen bg-ink px-4 py-10 text-ivory">
      {allowed ? (
        <CheckinScanner eventId={event.id} eventTitle={event.title} />
      ) : event.checkInPinHash ? (
        <PinGate eventId={event.id} eventTitle={event.title} />
      ) : (
        <p className="mx-auto max-w-[420px] text-center font-body text-ivory/75">
          Volunteer check-in is not turned on for this event. Ask the organiser to set a check-in PIN.
        </p>
      )}
    </main>
  )
}
