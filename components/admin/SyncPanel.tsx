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
    <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[18px] border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B] p-5">
      <div className="min-w-[240px] flex-1">
        <p className="font-semibold text-[#F7F1E3]">{label}</p>
        {!configured ? (
          <p className="text-[14px] text-[#f0a35e]">
            Not set up yet. Add the credentials in{' '}
            <Link href="/admin/settings" className="text-[#E3B23C] underline">
              Settings
            </Link>
            .
          </p>
        ) : last ? (
          <p className={`text-[14px] ${last.ok ? 'text-[rgba(247,241,227,0.7)]' : 'text-[#f87171]'}`}>
            Last sync {new Date(last.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}: {last.note}
          </p>
        ) : (
          <p className="text-[14px] text-[rgba(247,241,227,0.7)]">Not synced yet.</p>
        )}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={busy || !configured}
        className="inline-flex items-center gap-2 bg-[#E3B23C] px-6 py-3 font-semibold text-[#11142F] disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {busy ? 'Syncing' : 'Sync now'}
      </button>
    </div>
  )
}
