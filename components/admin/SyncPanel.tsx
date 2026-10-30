'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, RefreshCw } from 'lucide-react'

type Status = { at: string; ok: boolean; note: string } | null

export default function SyncPanel({
  source,
  label,
  configured,
  status,
}: {
  source: 'spotify' | 'youtube'
  label: string
  configured: boolean
  status: Status
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState(status)

  async function run() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/sync/${source}`, { method: 'POST' })
      const data = (await res.json()) as NonNullable<Status>
      setLast(data)
      if (data.ok) toast.success(data.note)
      else toast.error(data.note)
      router.refresh()
    } catch {
      toast.error('The sync didn’t finish. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[18px] border border-ivory/12 bg-ink p-5">
      <div className="min-w-[240px] flex-1">
        <p className="font-semibold text-ivory">{label}</p>
        {!configured ? (
          <p className="text-[14px] text-warn">
            Not set up yet. Add the credentials in{' '}
            <Link href="/admin/settings" className="text-gold underline">
              Settings
            </Link>
            .
          </p>
        ) : last ? (
          <p className={`text-[14px] ${last.ok ? 'text-ivory/70' : 'text-danger'}`}>
            Last sync {new Date(last.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}: {last.note}
          </p>
        ) : (
          <p className="text-[14px] text-ivory/70">Not synced yet.</p>
        )}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={busy || !configured}
        className="inline-flex items-center gap-2 bg-gold px-6 py-3 font-semibold text-night disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {busy ? 'Syncing' : 'Sync now'}
      </button>
    </div>
  )
}
