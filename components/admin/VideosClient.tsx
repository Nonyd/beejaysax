'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Star, Trash2 } from 'lucide-react'
import AdminInput from '@/components/admin/AdminInput'

type V = {
  id: string
  youtubeId: string
  title: string
  thumbnailUrl: string
  publishedAt: string | null
  isFeatured: boolean
  isHidden: boolean
  synced: boolean
}

export default function VideosClient({ videos }: { videos: V[] }) {
  const router = useRouter()
  const [list, setList] = useState(videos)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<'shown' | 'hidden'>('shown')

  async function patch(id: string, body: Partial<V>) {
    const res = await fetch(`/api/admin/videos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) return toast.error('That didn’t save.')
    setList((l) => l.map((v) => (v.id === id ? { ...v, ...body } : v)))
  }

  async function remove(v: V) {
    if (!confirm(v.synced ? 'Hide this video? Videos from the channel are hidden rather than deleted.' : 'Delete this video?')) return
    const res = await fetch(`/api/admin/videos/${v.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.hidden) setList((l) => l.map((x) => (x.id === v.id ? { ...x, isHidden: true } : x)))
    else if (data.deleted) setList((l) => l.filter((x) => x.id !== v.id))
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch('/api/admin/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, title }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUrl('')
      setTitle('')
      toast.success('Video added')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Not added')
    } finally {
      setAdding(false)
    }
  }

  const shown = list.filter((v) => (filter === 'shown' ? !v.isHidden : v.isHidden))
  const featured = list.filter((v) => v.isFeatured && !v.isHidden).length

  return (
    <div>
      <form onSubmit={add} className="mb-8 grid gap-3 rounded-[18px] border border-ivory/12 bg-ink p-5 md:grid-cols-[1.2fr_1fr_auto]">
        <AdminInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube link, e.g. https://youtu.be/…" aria-label="YouTube link" required />
        <AdminInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title to show" aria-label="Video title" required />
        <button type="submit" disabled={adding} className="inline-flex items-center justify-center gap-2 bg-gold px-6 py-3 font-semibold text-night">
          {adding && <Loader2 className="h-4 w-4 animate-spin" />}Add video
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['shown', 'hidden'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={filter === f ? 'bg-gold px-4 py-2 text-[13px] font-semibold text-night' : 'border border-ivory/20 px-4 py-2 text-[13px] text-ivory'}
          >
            {f === 'shown' ? `On the site (${list.filter((v) => !v.isHidden).length})` : `Hidden (${list.filter((v) => v.isHidden).length})`}
          </button>
        ))}
        <p className="ml-auto text-[13px] text-ivory/60">
          {featured ? `${featured} featured on the home page` : 'No featured videos: the home page shows the newest one.'}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[18px] border border-dashed border-ivory/20 p-12 text-center text-ivory/60">
          {filter === 'shown' ? 'No videos yet. Sync the channel or add one by link.' : 'Nothing hidden.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((v) => (
            <li key={v.id} className="overflow-hidden rounded-[18px] border border-ivory/12 bg-ink">
              <div className="relative aspect-video bg-night">
                <Image src={v.thumbnailUrl} alt="" fill sizes="400px" style={{ objectFit: 'cover' }} />
                {v.isFeatured && <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[12px] font-semibold text-night">Featured</span>}
              </div>
              <div className="p-4">
                <input
                  defaultValue={v.title}
                  aria-label="Title"
                  onBlur={(e) => e.target.value.trim() && e.target.value !== v.title && patch(v.id, { title: e.target.value.trim() })}
                  className="w-full bg-transparent font-semibold text-ivory outline-none focus:underline"
                />
                <p className="mt-1 text-[12px] text-ivory/55">
                  {v.synced ? 'From the channel' : 'Added by hand'}
                  {v.publishedAt ? ` · ${new Date(v.publishedAt).toLocaleDateString()}` : ''}
                </p>
                <div className="mt-3 flex gap-1">
                  <button type="button" onClick={() => patch(v.id, { isFeatured: !v.isFeatured })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-ivory" aria-pressed={v.isFeatured}>
                    <Star className="h-4 w-4" fill={v.isFeatured ? 'var(--gold)' : 'none'} color="var(--gold)" /> {v.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button type="button" onClick={() => patch(v.id, { isHidden: !v.isHidden })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-ivory">
                    {v.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {v.isHidden ? 'Show' : 'Hide'}
                  </button>
                  {!v.synced && (
                    <button type="button" onClick={() => remove(v)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-danger">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
