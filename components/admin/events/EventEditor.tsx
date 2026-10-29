'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminToggle from '@/components/admin/AdminToggle'
import ImageUpload from '@/components/admin/ImageUpload'

export type EditorTier = {
  id?: string
  name: string
  description: string
  price: string
  capacity: string
  admits: string
  maxPerOrder: string
  saleStartsAt: string
  saleEndsAt: string
  isVisible: boolean
  sold?: number
}

export type EditorEvent = {
  id?: string
  title: string
  slug: string
  excerpt: string
  description: string
  venue: string
  address: string
  city: string
  country: string
  eventDate: string
  endDate: string
  eventTime: string
  registrationDeadline: string
  totalTickets: string
  posterImage: string
  isFeatured: boolean
  status: 'DRAFT' | 'UPCOMING' | 'PAST' | 'CANCELLED'
  currency: string
  remindersEnabled: boolean
  hasPin: boolean
  tiers: EditorTier[]
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft (hidden from the site)' },
  { value: 'UPCOMING', label: 'Published, tickets on sale' },
  { value: 'PAST', label: 'Past event' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const blankTier = (name = 'Regular'): EditorTier => ({
  name,
  description: '',
  price: '',
  capacity: '',
  admits: '1',
  maxPerOrder: '10',
  saleStartsAt: '',
  saleEndsAt: '',
  isVisible: true,
})

/** datetime-local value (browser time) → ISO string */
const toIso = (v: string) => (v ? new Date(v).toISOString() : null)

/** ISO string → datetime-local value in the browser's time zone */
function isoToLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Dates arrive as ISO strings; convert to local time only in the browser (server time zone differs). */
function localiseDates(e: EditorEvent): EditorEvent {
  return {
    ...e,
    eventDate: isoToLocal(e.eventDate),
    endDate: isoToLocal(e.endDate),
    registrationDeadline: isoToLocal(e.registrationDeadline),
    tiers: e.tiers.map((t) => ({ ...t, saleStartsAt: isoToLocal(t.saleStartsAt), saleEndsAt: isoToLocal(t.saleEndsAt) })),
  }
}

export default function EventEditor({ initial, footer }: { initial: EditorEvent; footer?: React.ReactNode }) {
  const router = useRouter()
  const [ev, setEv] = useState<EditorEvent>(initial.tiers.length ? initial : { ...initial, tiers: [blankTier()] })
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setEv((e) => localiseDates(e))
    setReady(true)
  }, [])
  const [pin, setPin] = useState('')
  const [pinMode, setPinMode] = useState<'keep' | 'set' | 'remove'>('keep')
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof EditorEvent>(k: K, v: EditorEvent[K]) => setEv((e) => ({ ...e, [k]: v }))
  const setTier = (i: number, patch: Partial<EditorTier>) =>
    setEv((e) => ({ ...e, tiers: e.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) }))
  const moveTier = (i: number, dir: -1 | 1) =>
    setEv((e) => {
      const tiers = [...e.tiers]
      const j = i + dir
      if (j < 0 || j >= tiers.length) return e
      ;[tiers[i], tiers[j]] = [tiers[j], tiers[i]]
      return { ...e, tiers }
    })

  async function save(statusOverride?: EditorEvent['status']) {
    if (!ready) return
    setSaving(true)
    const status = statusOverride ?? ev.status
    const payload = {
      ...ev,
      status,
      eventDate: toIso(ev.eventDate),
      endDate: toIso(ev.endDate),
      registrationDeadline: toIso(ev.registrationDeadline),
      totalTickets: ev.totalTickets || null,
      checkInPin: pinMode === 'set' ? pin : pinMode === 'remove' ? '' : undefined,
      tiers: ev.tiers.map((t) => ({
        ...t,
        price: t.price || '0',
        capacity: t.capacity || null,
        saleStartsAt: toIso(t.saleStartsAt),
        saleEndsAt: toIso(t.saleEndsAt),
      })),
    }
    try {
      const res = await fetch(ev.id ? `/api/events/${ev.id}` : '/api/events', {
        method: ev.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'The event could not be saved.')
      toast.success(status === 'UPCOMING' && initial.status !== 'UPCOMING' ? 'Event published' : 'Event saved')
      setPin('')
      setPinMode('keep')
      if (!ev.id) router.push(`/admin/events/${data.id}/edit`)
      else {
        set('status', status)
        router.refresh()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The event could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const sym = ev.currency === 'NGN' ? '₦' : ev.currency === 'GBP' ? '£' : ev.currency === 'USD' ? '$' : ''

  return (
    <div className="mx-auto max-w-[900px] pb-28">
      <AdminSectionCard title="Event details" description="What people see on the event page.">
        <AdminFormField label="Title">
          <AdminInput value={ev.title} onChange={(e) => set('title', e.target.value)} placeholder="Beejay Sax Live Concert 2027" />
        </AdminFormField>
        <AdminFormField label="Short summary" optional>
          <AdminInput
            value={ev.excerpt}
            maxLength={300}
            onChange={(e) => set('excerpt', e.target.value)}
            placeholder="One line for cards and link previews"
          />
        </AdminFormField>
        <AdminFormField label="Description" optional>
          <AdminTextarea rows={6} value={ev.description} onChange={(e) => set('description', e.target.value)} />
        </AdminFormField>
        <AdminFormField label="Poster" optional>
          <ImageUpload
            folder="beejaysax/events"
            label="Upload event poster"
            aspectRatio="poster"
            currentUrl={ev.posterImage || undefined}
            onUpload={(url) => set('posterImage', url)}
          />
          {ev.posterImage && (
            <button type="button" onClick={() => set('posterImage', '')} className="mt-2 text-[13px] text-[#E3B23C] underline">
              Remove poster
            </button>
          )}
        </AdminFormField>
      </AdminSectionCard>

      <AdminSectionCard title="Date & venue" description="Times are in your device’s time zone.">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminFormField label="Starts">
            <AdminInput type="datetime-local" value={ev.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Ends" optional>
            <AdminInput type="datetime-local" value={ev.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Doors open" optional>
            <AdminInput value={ev.eventTime} onChange={(e) => set('eventTime', e.target.value)} placeholder="5:00 PM" />
          </AdminFormField>
          <AdminFormField label="Venue">
            <AdminInput value={ev.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Eko Hotels and Suites" />
          </AdminFormField>
          <div className="sm:col-span-2">
            <AdminFormField label="Address" optional>
              <AdminInput value={ev.address} onChange={(e) => set('address', e.target.value)} placeholder="Used for the map on the event page" />
            </AdminFormField>
          </div>
          <AdminFormField label="City">
            <AdminInput value={ev.city} onChange={(e) => set('city', e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Country">
            <AdminInput value={ev.country} onChange={(e) => set('country', e.target.value)} />
          </AdminFormField>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Tickets"
        description="Add a ticket type for each price (Regular, VIP, Table for 10…). Set the price to 0 for free entry."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <AdminFormField label="Currency">
            <AdminSelect
              value={ev.currency}
              onChange={(e) => set('currency', e.target.value)}
              options={[
                { value: 'NGN', label: 'Naira (₦)' },
                { value: 'USD', label: 'US dollar ($)' },
                { value: 'GBP', label: 'Pound (£)' },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="Total capacity" optional>
            <AdminInput type="number" min={1} value={ev.totalTickets} onChange={(e) => set('totalTickets', e.target.value)} placeholder="Unlimited" />
          </AdminFormField>
          <AdminFormField label="Sales close" optional>
            <AdminInput
              type="datetime-local"
              value={ev.registrationDeadline}
              onChange={(e) => set('registrationDeadline', e.target.value)}
            />
          </AdminFormField>
        </div>
        <p className="text-[12px] text-[rgba(247,241,227,0.55)]">If sales close is empty, sales stop when the event starts.</p>

        <ol className="mt-2 space-y-4">
          {ev.tiers.map((t, i) => (
            <li key={t.id ?? `new-${i}`} className="rounded-[16px] border border-[rgba(247,241,227,0.14)] bg-[#11142F] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-semibold text-[#F7F1E3]">
                  {t.name || `Ticket type ${i + 1}`}
                  {t.sold ? <span className="ml-2 text-[13px] font-normal text-[rgba(247,241,227,0.6)]">{t.sold} sold</span> : null}
                </p>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveTier(i, -1)} className="p-2 text-[rgba(247,241,227,0.7)] disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Move down" disabled={i === ev.tiers.length - 1} onClick={() => moveTier(i, 1)} className="p-2 text-[rgba(247,241,227,0.7)] disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t.isVisible ? 'Hide from sale' : 'Show for sale'}
                    title={t.isVisible ? 'Visible on the site' : 'Hidden from the site'}
                    onClick={() => setTier(i, { isVisible: !t.isVisible })}
                    className="p-2 text-[rgba(247,241,227,0.7)]"
                  >
                    {t.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-[#f0a35e]" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Remove ticket type"
                    disabled={ev.tiers.length === 1}
                    onClick={() => setEv((e) => ({ ...e, tiers: e.tiers.filter((_, j) => j !== i) }))}
                    className="p-2 text-[#f87171] disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <AdminFormField label="Name">
                    <AdminInput value={t.name} onChange={(e) => setTier(i, { name: e.target.value })} placeholder="VIP" />
                  </AdminFormField>
                </div>
                <AdminFormField label={`Price ${sym}`}>
                  <AdminInput type="number" min={0} step="any" value={t.price} onChange={(e) => setTier(i, { price: e.target.value })} placeholder="0 = free" />
                </AdminFormField>
                <AdminFormField label="Quantity" optional>
                  <AdminInput type="number" min={1} value={t.capacity} onChange={(e) => setTier(i, { capacity: e.target.value })} placeholder="No limit" />
                </AdminFormField>
                <div className="sm:col-span-4">
                  <AdminFormField label="What's included" optional>
                    <AdminInput value={t.description} maxLength={300} onChange={(e) => setTier(i, { description: e.target.value })} placeholder="Front rows, meet & greet…" />
                  </AdminFormField>
                </div>
                <AdminFormField label="People per ticket">
                  <AdminInput type="number" min={1} value={t.admits} onChange={(e) => setTier(i, { admits: e.target.value })} />
                </AdminFormField>
                <AdminFormField label="Max per order">
                  <AdminInput type="number" min={1} max={50} value={t.maxPerOrder} onChange={(e) => setTier(i, { maxPerOrder: e.target.value })} />
                </AdminFormField>
                <AdminFormField label="On sale from" optional>
                  <AdminInput type="datetime-local" value={t.saleStartsAt} onChange={(e) => setTier(i, { saleStartsAt: e.target.value })} />
                </AdminFormField>
                <AdminFormField label="On sale until" optional>
                  <AdminInput type="datetime-local" value={t.saleEndsAt} onChange={(e) => setTier(i, { saleEndsAt: e.target.value })} />
                </AdminFormField>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setEv((e) => ({ ...e, tiers: [...e.tiers, blankTier(e.tiers.length ? 'VIP' : 'Regular')] }))}
          className="inline-flex items-center gap-2 border border-[rgba(247,241,227,0.25)] px-5 py-2.5 font-semibold text-[#F7F1E3] hover:border-[#E3B23C]"
        >
          <Plus className="h-4 w-4" /> Add ticket type
        </button>
      </AdminSectionCard>

      <AdminSectionCard title="Publishing & reminders">
        <AdminFormField label="Status">
          <AdminSelect value={ev.status} options={STATUS_OPTIONS} onChange={(e) => set('status', e.target.value as EditorEvent['status'])} />
        </AdminFormField>
        <AdminToggle
          checked={ev.isFeatured}
          onChange={(v) => set('isFeatured', v)}
          label="Feature on the home page"
          description="Shows this event first in the home page events section."
        />
        <AdminToggle
          checked={ev.remindersEnabled}
          onChange={(v) => set('remindersEnabled', v)}
          label="Send reminder emails"
          description="Ticket holders get reminders a week before, the day before and on the morning of the event."
        />
      </AdminSectionCard>

      <AdminSectionCard
        title="Door check-in"
        description="Set a PIN so volunteers can scan tickets on their phones without an admin login."
      >
        <p className="text-[14px] text-[rgba(247,241,227,0.75)]">
          {initial.hasPin ? 'A check-in PIN is set.' : 'No check-in PIN yet. Only signed-in admins can scan.'}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-48">
            <AdminFormField label={initial.hasPin ? 'New PIN' : 'PIN'}>
              <AdminInput
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''))
                  setPinMode(e.target.value ? 'set' : 'keep')
                }}
                placeholder="4–8 digits"
              />
            </AdminFormField>
          </div>
          {initial.hasPin && (
            <button
              type="button"
              onClick={() => {
                setPin('')
                setPinMode(pinMode === 'remove' ? 'keep' : 'remove')
              }}
              className="pb-3 text-[13px] text-[#E3B23C] underline"
            >
              {pinMode === 'remove' ? 'Keep the current PIN' : 'Turn off PIN check-in'}
            </button>
          )}
        </div>
        {pinMode === 'remove' && <p className="text-[13px] text-[#f0a35e]">PIN check-in will be turned off when you save.</p>}
      </AdminSectionCard>

      {footer}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(247,241,227,0.12)] bg-[#11142F]/95 backdrop-blur md:left-[280px]">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-end gap-3 px-6 py-4">
          {ev.id && (
            <Link href={`/admin/events/${ev.id}/tickets`} className="mr-auto text-[14px] text-[rgba(247,241,227,0.7)] underline">
              Registrations
            </Link>
          )}
          {ev.status === 'DRAFT' && (
            <button type="button" disabled={saving} onClick={() => save('DRAFT')} className="border border-[rgba(247,241,227,0.25)] px-6 py-3 font-semibold text-[#F7F1E3]">
              Save draft
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => save(ev.status === 'DRAFT' ? 'UPCOMING' : undefined)}
            className="inline-flex items-center gap-2 bg-[#E3B23C] px-7 py-3 font-semibold text-[#11142F] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {ev.status === 'DRAFT' ? 'Publish event' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
