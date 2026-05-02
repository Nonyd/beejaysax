import EventForm from '@/components/admin/EventForm'

export default function NewEventPage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>
        New Event
      </h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>Add a new concert or appearance</p>
      <EventForm mode="create" />
    </div>
  )
}
