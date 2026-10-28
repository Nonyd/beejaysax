'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import AdminFormField from '@/components/admin/AdminFormField'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'

export default function BroadcastDialog({ eventId, recipients, onClose }: { eventId: string; recipients: number; onClose: () => void }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [testTo, setTestTo] = useState('')
  const [busy, setBusy] = useState<'test' | 'send' | null>(null)

  async function send(test: boolean) {
    if (!test && !confirm(`Send this email to ${recipients} ticket holder${recipients === 1 ? '' : 's'}?`)) return
    setBusy(test ? 'test' : 'send')
    try {
      const res = await fetch(`/api/admin/events/${eventId}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, testTo: test ? testTo : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (test) toast.success(`Preview sent to ${testTo}`)
      else {
        toast.success(`Sent to ${data.sent} of ${data.total}${data.failed ? `; ${data.failed} failed (see Emails)` : ''}`)
        onClose()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Not sent')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal aria-labelledby="bc-title">
      <div className="w-full max-w-[600px] rounded-[24px] border border-[rgba(247,241,227,0.14)] bg-[#1B1F4B] p-7">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p id="bc-title" className="font-display text-2xl text-[#F7F1E3]">Email attendees</p>
            <p className="mt-1 text-[14px] text-[rgba(247,241,227,0.65)]">
              Goes to {recipients} ticket holder{recipients === 1 ? '' : 's'}, with the event details added at the bottom.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-[rgba(247,241,227,0.7)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <AdminFormField label="Subject">
            <AdminInput value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} placeholder="Doors now open at 4:30 PM" />
          </AdminFormField>
          <AdminFormField label="Message">
            <AdminTextarea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave a blank line between paragraphs." />
          </AdminFormField>
          <div className="flex flex-wrap items-end gap-2 rounded-[14px] bg-[#11142F] p-4">
            <div className="min-w-[220px] flex-1">
              <AdminFormField label="Send a preview to" optional>
                <AdminInput type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" />
              </AdminFormField>
            </div>
            <button
              type="button"
              disabled={!subject || !message || !testTo || busy !== null}
              onClick={() => send(true)}
              className="inline-flex h-[46px] items-center gap-2 border border-[rgba(247,241,227,0.25)] px-5 text-[#F7F1E3] disabled:opacity-50"
            >
              {busy === 'test' && <Loader2 className="h-4 w-4 animate-spin" />}Send preview
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="border border-[rgba(247,241,227,0.25)] px-5 py-3 text-[#F7F1E3]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!subject || !message || recipients === 0 || busy !== null}
            onClick={() => send(false)}
            className="inline-flex items-center gap-2 bg-[#E3B23C] px-6 py-3 font-semibold text-[#11142F] disabled:opacity-50"
          >
            {busy === 'send' && <Loader2 className="h-4 w-4 animate-spin" />}Send to {recipients}
          </button>
        </div>
      </div>
    </div>
  )
}
