'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'

export type CouponRow = {
  id: string
  code: string
  percentOff: number | null
  amountOff: number | null
  maxUses: number | null
  usedCount: number
  endsAt: string | null
  isActive: boolean
}

export default function CouponsPanel({ eventId, initial, currencySymbol }: { eventId: string; initial: CouponRow[]; currencySymbol: string }) {
  const [coupons, setCoupons] = useState(initial)
  const [form, setForm] = useState({ code: '', kind: 'percent' as 'percent' | 'amount', value: '', maxUses: '', endsAt: '' })
  const [busy, setBusy] = useState(false)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          percentOff: form.kind === 'percent' ? form.value : null,
          amountOff: form.kind === 'amount' ? form.value : null,
          maxUses: form.maxUses,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoupons((c) => [data.coupon, ...c])
      setForm({ code: '', kind: form.kind, value: '', maxUses: '', endsAt: '' })
      toast.success(`Code ${data.coupon.code} created`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'The code could not be created.')
    } finally {
      setBusy(false)
    }
  }

  async function toggle(c: CouponRow) {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    if (res.ok) setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, isActive: !c.isActive } : x)))
  }

  async function remove(c: CouponRow) {
    if (!confirm(`Delete the code ${c.code}?`)) return
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.deleted) setCoupons((list) => list.filter((x) => x.id !== c.id))
    else if (data.deactivated) {
      setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, isActive: false } : x)))
      toast('This code has been used, so it was turned off instead of deleted.')
    }
  }

  return (
    <AdminSectionCard title="Discount codes" description="Buyers enter these at checkout. Free events don’t need them.">
      <form onSubmit={create} className="grid items-end gap-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_1fr_auto]">
        <AdminFormField label="Code">
          <AdminInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EARLYBIRD" required />
        </AdminFormField>
        <AdminFormField label="Type">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as 'percent' | 'amount' })}
            className="w-full rounded-[12px] border border-ivory/16 bg-night px-3 py-3 text-sm text-ivory"
          >
            <option value="percent">% off</option>
            <option value="amount">{currencySymbol} off</option>
          </select>
        </AdminFormField>
        <AdminFormField label="Value">
          <AdminInput type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </AdminFormField>
        <AdminFormField label="Uses" optional>
          <AdminInput type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="∞" />
        </AdminFormField>
        <AdminFormField label="Expires" optional>
          <AdminInput type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </AdminFormField>
        <button type="submit" disabled={busy} className="inline-flex h-[46px] items-center gap-2 bg-gold px-5 font-semibold text-night">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Add
        </button>
      </form>

      {coupons.length > 0 && (
        <ul className="divide-y divide-ivory/10 rounded-[14px] border border-ivory/12">
          {coupons.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-[14px]">
              <code className={`font-semibold ${c.isActive ? 'text-gold' : 'text-ivory/40 line-through'}`}>{c.code}</code>
              <span className="text-ivory">{c.percentOff ? `${c.percentOff}% off` : `${currencySymbol}${c.amountOff?.toLocaleString()} off`}</span>
              <span className="text-ivory/60">
                Used {c.usedCount}
                {c.maxUses ? ` of ${c.maxUses}` : ''}
              </span>
              {c.endsAt && <span className="text-ivory/60">Until {new Date(c.endsAt).toLocaleDateString()}</span>}
              <span className="ml-auto flex gap-4">
                <button type="button" onClick={() => toggle(c)} className="text-gold underline">
                  {c.isActive ? 'Turn off' : 'Turn on'}
                </button>
                <button type="button" onClick={() => remove(c)} className="text-danger underline">
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminSectionCard>
  )
}
