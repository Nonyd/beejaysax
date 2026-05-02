'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import AdminInput from './AdminInput'
import AdminTextarea from './AdminTextarea'
import AdminSelect from './AdminSelect'
import AdminToggle from './AdminToggle'
import CloudinaryUpload from './CloudinaryUpload'
import SectionLabel from '@/components/ui/SectionLabel'
import type { Event, EventStatus } from '@prisma/client'

interface EventFormProps {
  mode: 'create' | 'edit'
  event?: Event | null
}

export default function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [address, setAddress] = useState(event?.address ?? '')
  const [city, setCity] = useState(event?.city ?? '')
  const [country, setCountry] = useState(event?.country ?? 'Nigeria')
  const [eventDate, setEventDate] = useState(
    event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : ''
  )
  const [eventTime, setEventTime] = useState(event?.eventTime ?? '')
  const [isFree, setIsFree] = useState(event?.isFree ?? false)
  const [ticketPrice, setTicketPrice] = useState(event?.ticketPrice?.toString() ?? '')
  const [totalTickets, setTotalTickets] = useState(event?.totalTickets?.toString() ?? '')
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured ?? false)
  const [status, setStatus] = useState<EventStatus>(event?.status ?? 'UPCOMING')
  const [posterImage, setPosterImage] = useState(event?.posterImage ?? '')

  async function handleSubmit() {
    if (!title || !venue || !city || !eventDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title,
        description,
        venue,
        address,
        city,
        country,
        eventDate: new Date(eventDate).toISOString(),
        eventTime: eventTime || null,
        isFree,
        ticketPrice: isFree ? null : ticketPrice ? parseFloat(ticketPrice) : null,
        totalTickets: totalTickets ? parseInt(totalTickets, 10) : null,
        isFeatured,
        status,
        posterImage: posterImage || null,
      }

      const url = mode === 'create' ? '/api/events' : `/api/events/${event!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(mode === 'create' ? 'Event created!' : 'Event updated!')
        router.push('/admin/events')
        router.refresh()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <SectionLabel className="mb-4">Event Details</SectionLabel>
        <div className="space-y-4">
          <AdminFormField label="Title *">
            <AdminInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Beejay Sax Live Concert 2026"
            />
          </AdminFormField>
          <AdminFormField label="Description" optional>
            <AdminTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the event..."
            />
          </AdminFormField>
        </div>
      </section>

      <section>
        <SectionLabel className="mb-4">Location</SectionLabel>
        <div className="space-y-4">
          <AdminFormField label="Venue *">
            <AdminInput
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Eko Hotels and Suites"
            />
          </AdminFormField>
          <AdminFormField label="Address" optional>
            <AdminInput
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full street address"
            />
          </AdminFormField>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="City *">
              <AdminInput value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos" />
            </AdminFormField>
            <AdminFormField label="Country">
              <AdminInput value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Nigeria" />
            </AdminFormField>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel className="mb-4">Date & Time</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <AdminFormField label="Event Date *">
            <AdminInput type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Event Time" optional>
            <AdminInput type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </AdminFormField>
        </div>
      </section>

      <section>
        <SectionLabel className="mb-4">Tickets</SectionLabel>
        <div className="space-y-4">
          <AdminToggle
            checked={isFree}
            onChange={setIsFree}
            label="Free Event"
            description="Attendees register for free — no payment required"
          />
          {!isFree && (
            <div className="grid grid-cols-2 gap-4">
              <AdminFormField label="Ticket Price (₦)">
                <AdminInput
                  type="number"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="5000"
                  min="0"
                />
              </AdminFormField>
              <AdminFormField label="Total Tickets" optional>
                <AdminInput
                  type="number"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                />
              </AdminFormField>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionLabel className="mb-4">Poster Image</SectionLabel>
        <CloudinaryUpload
          onUpload={(url) => setPosterImage(url)}
          folder="beejaysax/events"
          label="Upload Event Poster"
          currentUrl={posterImage || undefined}
          aspectRatio="poster"
        />
        {posterImage && (
          <div className="mt-3 flex items-center gap-3">
            <input
              value={posterImage}
              onChange={(e) => setPosterImage(e.target.value)}
              placeholder="Or paste Cloudinary URL directly..."
              className="flex-1 bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
              style={{ fontSize: 11 }}
            />
            <button
              type="button"
              onClick={() => setPosterImage('')}
              style={{
                fontSize: 11,
                color: '#f87171',
                border: '1px solid rgba(127,29,29,0.4)',
                padding: '8px 12px',
              }}
            >
              Remove
            </button>
          </div>
        )}
      </section>

      <section>
        <SectionLabel className="mb-4">Settings</SectionLabel>
        <div className="space-y-3">
          <AdminToggle
            checked={isFeatured}
            onChange={setIsFeatured}
            label="Featured Event"
            description="Show this event on the homepage"
          />
          <AdminFormField label="Status">
            <AdminSelect
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              options={[
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'PAST', label: 'Past' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </AdminFormField>
        </div>
      </section>

      <div className="flex gap-3 border-t border-[#1E1E1E] pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#C9A84C] px-8 py-3 font-semibold text-[#080808] transition hover:bg-[#E8C96D] disabled:opacity-40"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-[#2A2A2A] px-8 py-3 text-white transition hover:border-[#555]"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
