'use client'

import GoldButton from '@/components/ui/GoldButton'

export default function TicketActionsBar({
  token,
  eventTitle,
  venue,
  city,
  country,
  ticketPageUrl,
}: {
  token: string
  eventTitle: string
  venue: string
  city: string
  country: string
  ticketPageUrl: string
}) {
  const place = [venue, city, country].filter(Boolean).join(', ')
  const wa = encodeURIComponent(`${eventTitle}\n${place}\nMy ticket: ${ticketPageUrl}`)

  return (
    <div className="no-print mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
      <GoldButton type="button" onClick={() => window.print()} className="min-w-[200px] justify-center">
        Print / Save PDF
      </GoldButton>
      <GoldButton
        href={`https://wa.me/?text=${wa}`}
        className="min-w-[200px] justify-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on WhatsApp
      </GoldButton>
      <GoldButton href={`/api/tickets/${token}/calendar`} className="min-w-[200px] justify-center">
        Add to calendar
      </GoldButton>
    </div>
  )
}
