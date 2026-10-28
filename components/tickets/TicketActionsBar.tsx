'use client'

import { CalendarPlus, MessageCircle, Printer } from 'lucide-react'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'

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
    <div className="no-print mt-10 flex flex-col gap-3">
      <GoldButton type="button" onClick={() => window.print()} className="w-full">
        <Printer className="h-4 w-4" aria-hidden />
        Print or save as PDF
      </GoldButton>
      <div className="grid gap-3 sm:grid-cols-2">
        <OutlineButton href={`https://wa.me/?text=${wa}`} target="_blank" rel="noopener noreferrer" className="w-full">
          <MessageCircle className="h-4 w-4" aria-hidden />
          Share on WhatsApp
        </OutlineButton>
        <OutlineButton href={`/api/tickets/${token}/calendar`} className="w-full">
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add to calendar
        </OutlineButton>
      </div>
    </div>
  )
}
