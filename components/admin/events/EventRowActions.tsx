'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Copy, ExternalLink, MoreHorizontal, Pencil, ScanLine, Trash2, Users } from 'lucide-react'

export default function EventRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function call(url: string, init: RequestInit, ok: string) {
    setOpen(false)
    const res = await fetch(url, init)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error ?? 'That didn’t work.')
      return null
    }
    toast.success(ok)
    return data
  }

  const item = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] text-ivory no-underline hover:bg-surface-3'

  return (
    <div className="relative flex items-center justify-end gap-2">
      <Link href={`/admin/events/${id}/tickets`} className="rounded-full border border-ivory/20 px-4 py-1.5 text-sm text-ivory no-underline hover:border-gold">
        Registrations
      </Link>
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center text-ivory"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute top-11 right-0 z-20 w-56 overflow-hidden rounded-[14px] border border-ivory/14 bg-surface-2 py-1 shadow-2xl">
            <Link href={`/admin/events/${id}/edit`} className={item}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Link href={`/admin/events/${id}/checkin`} className={item}>
              <ScanLine className="h-4 w-4" /> Door scanner
            </Link>
            <Link href={`/admin/events/${id}/tickets`} className={item}>
              <Users className="h-4 w-4" /> Registrations
            </Link>
            {status !== 'DRAFT' && (
              <a href={`/events/${id}`} target="_blank" rel="noopener noreferrer" className={item}>
                <ExternalLink className="h-4 w-4" /> View on site
              </a>
            )}
            <button
              type="button"
              className={item}
              onClick={async () => {
                const d = await call(`/api/admin/events/${id}/duplicate`, { method: 'POST' }, 'Copied as a new draft')
                if (d?.id) router.push(`/admin/events/${d.id}/edit`)
              }}
            >
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            <button
              type="button"
              className={`${item} text-danger`}
              onClick={async () => {
                if (!confirm('Delete this event? This can’t be undone.')) return
                if (await call(`/api/events/${id}`, { method: 'DELETE' }, 'Event deleted')) router.refresh()
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
