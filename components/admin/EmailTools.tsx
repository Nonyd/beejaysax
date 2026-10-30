'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AdminInput from '@/components/admin/AdminInput'

async function post(body: Record<string, string>) {
  const res = await fetch('/api/admin/emails', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'That didn’t work.')
  return data
}

export function RetryButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await post({ action: 'retry', id })
          toast.success('Sent')
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Still failing')
        } finally {
          setBusy(false)
          router.refresh()
        }
      }}
      className="mt-1 inline-flex items-center gap-1 text-[12px] text-gold underline"
    >
      {busy && <Loader2 className="h-3 w-3 animate-spin" />}Retry now
    </button>
  )
}

function EmailTools({ suppressions }: { suppressions: { email: string; reason: string; at: string }[] }) {
  const router = useRouter()
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="rounded-[20px] border border-ivory/12 bg-ink p-6"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          try {
            const r = await post({ action: 'test', to })
            toast.success(`Test email sent with ${r.provider}`)
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Not sent')
          } finally {
            setBusy(false)
            router.refresh()
          }
        }}
      >
        <p className="font-display text-xl text-ivory">Send a test email</p>
        <p className="mt-1 mb-4 text-[14px] text-ivory/65">Checks that your email settings work end to end.</p>
        <div className="flex gap-2">
          <AdminInput type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com" aria-label="Test recipient" />
          <button type="submit" disabled={busy} className="inline-flex shrink-0 items-center gap-2 bg-gold px-5 font-semibold text-night">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Send
          </button>
        </div>
      </form>

      <div className="rounded-[20px] border border-ivory/12 bg-ink p-6">
        <p className="font-display text-xl text-ivory">Blocked addresses</p>
        <p className="mt-1 mb-4 text-[14px] text-ivory/65">
          Addresses that bounced or marked us as spam aren’t emailed again. Remove one if the person fixed their mailbox.
        </p>
        {suppressions.length === 0 ? (
          <p className="text-[14px] text-ivory/55">None.</p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {suppressions.map((s) => (
              <li key={s.email} className="flex items-center justify-between gap-3 text-[14px]">
                <span className="min-w-0 truncate text-ivory">
                  {s.email} <span className="text-[12px] text-ivory/55">{s.reason.toLowerCase()}, {s.at}</span>
                </span>
                <button
                  type="button"
                  className="shrink-0 text-[13px] text-gold underline"
                  onClick={async () => {
                    await post({ action: 'unsuppress', email: s.email })
                    toast.success('Removed')
                    router.refresh()
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default EmailTools
