'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminSectionCard from '@/components/admin/AdminSectionCard'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import type { MaintenanceState } from '@/lib/maintenance'

export default function MaintenanceClient({ initial, defaultMessage }: { initial: MaintenanceState; defaultMessage: string }) {
  const [state, setState] = useState(initial)
  const [message, setMessage] = useState(initial.message)
  const [until, setUntil] = useState(initial.until)
  const [saving, setSaving] = useState(false)

  async function save(enabled: boolean) {
    if (enabled && !state.enabled && !confirm('Take the public site offline? Visitors will see the maintenance page until you turn it off.')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, message, until }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not save.')
      setState(data.maintenance)
      toast.success(enabled === state.enabled ? 'Saved' : enabled ? 'Maintenance mode is on' : 'The site is live again')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-[14px] border px-5 py-4 ${
          state.enabled ? 'border-warn/50 text-warn' : 'border-success/30 text-success'
        }`}
      >
        <div>
          <p className="text-[16px] font-semibold">{state.enabled ? 'The site is in maintenance mode' : 'The site is live'}</p>
          {state.updatedAt && (
            <p className="mt-1 text-[13px] text-ivory/60">
              Last changed by {state.updatedBy} on {new Date(state.updatedAt).toLocaleString('en-NG')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => save(!state.enabled)}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-50 ${
            state.enabled ? 'bg-success text-night' : 'bg-warn text-night'
          }`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {state.enabled ? 'Bring the site back' : 'Turn on maintenance mode'}
        </button>
      </div>

      <AdminSectionCard
        title="Maintenance page"
        description="What visitors see while the site is offline. Signed-in admins still see the normal site, so you can check your changes before going live."
      >
        <div className="space-y-5">
          <AdminFormField label="Message" optional>
            <AdminTextarea rows={4} value={message} placeholder={defaultMessage} onChange={(e) => setMessage(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Expected back" optional>
            <AdminInput value={until} placeholder="Back by 6pm today" onChange={(e) => setUntil(e.target.value)} />
          </AdminFormField>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => save(state.enabled)}
              disabled={saving || (message === state.message && until === state.until)}
              className="bg-gold px-6 py-3 font-semibold text-night disabled:opacity-50"
            >
              Save message
            </button>
            <a href="/maintenance" target="_blank" rel="noreferrer" className="text-[14px] text-gold">
              {state.enabled ? 'Preview the maintenance page ↗' : 'Preview is available once maintenance mode is on'}
            </a>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="What keeps working" description="So nothing breaks for people already mid-purchase or at an event.">
        <ul className="list-disc space-y-2 pl-5 text-[14px] text-ivory/75">
          <li>This admin area, for every account.</li>
          <li>Payments already in progress (Paystack confirmations) and email delivery updates.</li>
          <li>Attendees’ ticket links, ticket PDFs and QR codes.</li>
          <li>Door check-in, for admins and PIN volunteers.</li>
          <li>Scheduled jobs such as reminders.</li>
        </ul>
        <p className="mt-4 text-[14px] text-ivory/60">
          Everything else, including buying new tickets and the contact form, is paused. Search engines are told the outage is
          temporary (HTTP 503), so rankings are not affected by a short break.
        </p>
      </AdminSectionCard>
    </div>
  )
}
