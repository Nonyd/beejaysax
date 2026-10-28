'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Download, Loader2, Mail, Search, UserPlus, X } from 'lucide-react'
import BroadcastDialog from '@/components/admin/events/BroadcastDialog'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminSelect from '@/components/admin/AdminSelect'

export type RegRow = {
  id: string
  ticketNumber: string
  name: string
  email: string
  phone: string | null
  tier: string
  tierId: string | null
  amount: number
  reference: string | null
  source: string
  isUsed: boolean
  usedAt: string | null
  usedBy: string | null
  cancelled: boolean
  qrToken: string
  createdAt: string
  emailStatus: string | null
  emailError: string | null
}

type StatusFilter = 'all' | 'in' | 'out' | 'cancelled'
type Action = 'resend' | 'checkin' | 'undo_checkin' | 'cancel' | 'restore' | 'refund'

const ACTION_LABEL: Record<Action, string> = {
  resend: 'Resend tickets',
  checkin: 'Mark checked in',
  undo_checkin: 'Undo check-in',
  cancel: 'Cancel tickets',
  restore: 'Restore',
  refund: 'Refund orders',
}

export default function RegistrationsClient({
  eventId,
  rows,
  tiers,
  currencySymbol,
  siteUrl,
}: {
  eventId: string
  rows: RegRow[]
  tiers: { id: string; name: string }[]
  currencySymbol: string
  siteUrl: string
}) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<Action | null>(null)
  const [compOpen, setCompOpen] = useState(false)
  const [mailOpen, setMailOpen] = useState(false)
  const recipients = new Set(rows.filter((r) => !r.cancelled).map((r) => r.email)).size

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (tier !== 'all' && r.tierId !== tier) return false
      if (status === 'in' && (!r.isUsed || r.cancelled)) return false
      if (status === 'out' && (r.isUsed || r.cancelled)) return false
      if (status === 'cancelled' && !r.cancelled) return false
      if (status !== 'cancelled' && status !== 'all' && r.cancelled) return false
      if (!term) return true
      return [r.name, r.email, r.ticketNumber, r.reference ?? '', r.phone ?? ''].some((v) => v.toLowerCase().includes(term))
    })
  }, [rows, q, tier, status])

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s)
      if (allSelected) filtered.forEach((r) => n.delete(r.id))
      else filtered.forEach((r) => n.add(r.id))
      return n
    })

  async function run(action: Action) {
    const ids = [...selected]
    if (action === 'cancel' && !confirm(`Cancel ${ids.length} ticket(s)? They will no longer get in at the door.`)) return
    if (
      action === 'refund' &&
      !confirm('Refund the selected orders through Paystack? Every ticket in those orders is cancelled and the buyer gets their money back.')
    )
      return
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ticketIds: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${ACTION_LABEL[action]}: ${data.done} done`)
      setSelected(new Set())
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'That didn’t work. Try again.')
    } finally {
      setBusy(null)
    }
  }

  const chip = (value: StatusFilter, label: string) => (
    <button
      type="button"
      onClick={() => setStatus(value)}
      aria-pressed={status === value}
      className={status === value ? 'bg-[#E3B23C] px-4 py-2 text-[13px] font-semibold text-[#11142F]' : 'border border-[rgba(247,241,227,0.2)] px-4 py-2 text-[13px] text-[#F7F1E3]'}
    >
      {label}
    </button>
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search aria-hidden className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[rgba(247,241,227,0.45)]" />
          <AdminInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, ticket or order number" className="pl-11" aria-label="Search registrations" />
        </div>
        {tiers.length > 1 && (
          <div className="w-48">
            <AdminSelect aria-label="Ticket type" value={tier} onChange={(e) => setTier(e.target.value)} options={[{ value: 'all', label: 'All ticket types' }, ...tiers.map((t) => ({ value: t.id, label: t.name }))]} />
          </div>
        )}
        <a href={`/api/admin/events/${eventId}/export`} className="inline-flex items-center gap-2 border border-[rgba(247,241,227,0.2)] px-5 py-3 text-[14px] font-semibold text-[#F7F1E3] no-underline">
          <Download className="h-4 w-4" /> Export CSV
        </a>
        <button type="button" onClick={() => setMailOpen(true)} className="inline-flex items-center gap-2 border border-[rgba(247,241,227,0.2)] px-5 py-3 text-[14px] font-semibold text-[#F7F1E3]">
          <Mail className="h-4 w-4" /> Email attendees
        </button>
        <button type="button" onClick={() => setCompOpen(true)} className="inline-flex items-center gap-2 bg-[#E3B23C] px-5 py-3 text-[14px] font-semibold text-[#11142F]">
          <UserPlus className="h-4 w-4" /> Add guest ticket
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {chip('all', `All (${rows.length})`)}
        {chip('out', 'Not checked in')}
        {chip('in', 'Checked in')}
        {chip('cancelled', 'Cancelled')}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#E3B23C]/40 bg-[#20255A] px-4 py-3">
          <span className="text-[14px] font-semibold text-[#F7F1E3]">{selected.size} selected</span>
          {(Object.keys(ACTION_LABEL) as Action[]).map((a) => (
            <button
              key={a}
              type="button"
              disabled={busy !== null}
              onClick={() => run(a)}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-[13px] ${a === 'cancel' || a === 'refund' ? 'border-[#f87171]/50 text-[#f87171]' : 'border-[rgba(247,241,227,0.25)] text-[#F7F1E3]'}`}
            >
              {busy === a && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {ACTION_LABEL[a]}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-[13px] text-[rgba(247,241,227,0.7)] underline">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[18px] border border-[rgba(247,241,227,0.12)]">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="bg-[#1B1F4B] text-[12px] text-[rgba(247,241,227,0.6)]">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all shown" className="accent-[#E3B23C]" />
              </th>
              <th className="px-3 py-3 font-semibold">Attendee</th>
              <th className="px-3 py-3 font-semibold">Ticket</th>
              <th className="px-3 py-3 font-semibold">Paid</th>
              <th className="px-3 py-3 font-semibold">Order</th>
              <th className="px-3 py-3 font-semibold">Door</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(247,241,227,0.08)]">
            {filtered.map((r) => (
              <tr key={r.id} className={r.cancelled ? 'opacity-50' : undefined}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    aria-label={`Select ${r.name}`}
                    onChange={() =>
                      setSelected((s) => {
                        const n = new Set(s)
                        if (n.has(r.id)) n.delete(r.id)
                        else n.add(r.id)
                        return n
                      })
                    }
                    className="accent-[#E3B23C]"
                  />
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-[#F7F1E3]">{r.name}</p>
                  <p className="text-[13px] text-[rgba(247,241,227,0.6)]">
                    {r.email}
                    {r.phone ? ` · ${r.phone}` : ''}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <a href={`${siteUrl}/tickets/${r.qrToken}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#E3B23C] underline">
                    {r.ticketNumber}
                  </a>
                  <p className="text-[13px] text-[rgba(247,241,227,0.6)]">
                    {r.tier}
                    {r.source === 'COMPLIMENTARY' && <span className="ml-2 text-[#a78bfa]">Guest</span>}
                  </p>
                  {r.emailStatus && r.emailStatus !== 'SENT' && (
                    <p className="text-[12px] font-semibold text-[#f87171]" title={r.emailError ?? undefined}>
                      {r.emailStatus === 'SUPPRESSED' ? 'Email blocked (bounced before)' : 'Email not delivered'}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 text-[#F7F1E3]">{r.amount ? `${currencySymbol}${r.amount.toLocaleString()}` : 'Free'}</td>
                <td className="px-3 py-3 text-[13px] text-[rgba(247,241,227,0.7)]">
                  {r.reference ?? '—'}
                  <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-3 py-3 text-[13px]">
                  {r.cancelled ? (
                    <span className="text-[#f87171]">Cancelled</span>
                  ) : r.isUsed ? (
                    <span className="text-[#4ade80]" title={r.usedBy ?? undefined}>
                      In at {r.usedAt ? new Date(r.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  ) : (
                    <span className="text-[rgba(247,241,227,0.6)]">Not yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-6 py-12 text-center text-[rgba(247,241,227,0.6)]">
            {rows.length === 0 ? 'No tickets yet. They appear here as soon as someone registers.' : 'No tickets match these filters.'}
          </p>
        )}
      </div>

      {mailOpen && <BroadcastDialog eventId={eventId} recipients={recipients} onClose={() => setMailOpen(false)} />}
      {compOpen && <CompDialog eventId={eventId} tiers={tiers} onClose={() => setCompOpen(false)} onDone={() => router.refresh()} />}
    </div>
  )
}

function CompDialog({
  eventId,
  tiers,
  onClose,
  onDone,
}: {
  eventId: string
  tiers: { id: string; name: string }[]
  onClose: () => void
  onDone: () => void
}) {
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', tierId: tiers[0]?.id ?? '', quantity: '1', note: '' })
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/comp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.emailed) toast.success(`Ticket issued and emailed to ${f.email}`)
      else toast(`Ticket issued, but the email didn’t send${data.emailError ? `: ${data.emailError}` : ''}. Use “Resend tickets”.`)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The ticket could not be issued.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal aria-labelledby="comp-title">
      <form onSubmit={submit} className="w-full max-w-[520px] rounded-[24px] border border-[rgba(247,241,227,0.14)] bg-[#1B1F4B] p-7">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p id="comp-title" className="font-display text-2xl text-[#F7F1E3]">Add guest ticket</p>
            <p className="mt-1 text-[14px] text-[rgba(247,241,227,0.65)]">Free complimentary or VIP tickets, emailed to the guest.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-[rgba(247,241,227,0.7)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label="First name">
            <AdminInput required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Last name">
            <AdminInput required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
          </AdminFormField>
          <div className="sm:col-span-2">
            <AdminFormField label="Email">
              <AdminInput type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </AdminFormField>
          </div>
          <AdminFormField label="Ticket type">
            <AdminSelect value={f.tierId} onChange={(e) => setF({ ...f, tierId: e.target.value })} options={tiers.map((t) => ({ value: t.id, label: t.name }))} />
          </AdminFormField>
          <AdminFormField label="How many">
            <AdminInput type="number" min={1} max={20} value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
          </AdminFormField>
          <div className="sm:col-span-2">
            <AdminFormField label="Note" optional>
              <AdminInput value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Guest of the artist" />
            </AdminFormField>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="border border-[rgba(247,241,227,0.25)] px-5 py-3 text-[#F7F1E3]">
            Cancel
          </button>
          <button type="submit" disabled={busy || !f.tierId} className="inline-flex items-center gap-2 bg-[#E3B23C] px-6 py-3 font-semibold text-[#11142F]">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Issue ticket
          </button>
        </div>
      </form>
    </div>
  )
}
