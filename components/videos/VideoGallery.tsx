'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Play, Search } from 'lucide-react'
import { usePlayer } from '@/components/player/PlayerProvider'
import ConsentEmbed from '@/components/consent/ConsentEmbed'
import { cn } from '@/lib/utils'

export type GalleryVideo = {
  id: string
  youtubeId: string
  title: string
  description: string | null
  thumbnail: string | null
  publishedAt: string | null
  durationSec: number | null
}

const PAGE = 12

const thumb = (v: GalleryVideo) => v.thumbnail ?? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`

/** Thumbnail with a branded stand-in when YouTube has no image (e.g. a removed video). */
function Thumb({ video, sizes, priority, className }: { video: GalleryVideo; sizes: string; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-2 via-ink to-night font-display text-5xl text-gold/40"
      >
        ♪
      </span>
    )
  }
  return <Image src={thumb(video)} alt="" fill priority={priority} sizes={sizes} className={cn('object-cover', className)} onError={() => setFailed(true)} />
}

function duration(sec: number | null) {
  if (!sec) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = String(sec % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

function date(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
}

/**
 * "Now playing" screen plus a searchable grid. Picking a video loads it into the screen,
 * scrolls up to it and puts ?v=… in the address so the video can be shared.
 */
export default function VideoGallery({ videos, initialId }: { videos: GalleryVideo[]; initialId: string | null }) {
  const player = usePlayer()
  const stage = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState(initialId ?? videos[0]?.youtubeId ?? null)
  const [playing, setPlaying] = useState(false)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)

  const selected = videos.find((v) => v.youtubeId === selectedId) ?? videos[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? videos.filter((v) => v.title.toLowerCase().includes(q)) : videos
  }, [videos, query])

  if (!selected) {
    return (
      <section className="bg-night py-24 text-center">
        <p className="font-display text-3xl text-ivory">Videos are on the way</p>
        <p className="mt-3 font-body text-base text-ivory/65">New videos appear here as soon as they’re on YouTube.</p>
      </section>
    )
  }

  function start() {
    // A music preview and a video shouldn't play over each other.
    if (player.playing) player.toggle()
    setPlaying(true)
  }

  function pick(v: GalleryVideo) {
    setSelectedId(v.youtubeId)
    start()
    const url = new URL(window.location.href)
    url.searchParams.set('v', v.youtubeId)
    window.history.replaceState(null, '', url)
    stage.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const meta = [date(selected.publishedAt), duration(selected.durationSec)].filter(Boolean).join(' · ')

  return (
    <section className="bg-night py-16 md:py-24">
      <div className="site-shell">
        {/* Now playing */}
        <div ref={stage} className="scroll-mt-28">
          <div className="relative aspect-video overflow-hidden rounded-[28px] bg-ink shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            {playing ? (
              <ConsentEmbed kind="youtube" className="absolute inset-0">
                <iframe
                  key={selected.youtubeId}
                  title={selected.title}
                  src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </ConsentEmbed>
            ) : (
              <button
                type="button"
                onClick={start}
                aria-label={`Play video: ${selected.title}`}
                className="group absolute inset-0 h-full w-full cursor-pointer"
              >
                <Thumb key={selected.youtubeId} video={selected} priority sizes="(max-width:1240px) 100vw, 1140px" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-night transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                  <Play aria-hidden className="ml-1 h-7 w-7 fill-current md:h-9 md:w-9" />
                </span>
              </button>
            )}
          </div>
          <div className="mt-6 max-w-[70ch]">
            <h2 className="font-display text-[clamp(26px,3.4vw,44px)] leading-tight text-ivory">{selected.title}</h2>
            {meta && <p className="mt-2 font-body text-sm text-ivory/55">{meta}</p>}
          </div>
        </div>

        {/* All videos */}
        {videos.length > 1 && (
          <div className="mt-20">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-[clamp(32px,4vw,52px)] leading-none text-ivory">
                All videos <span className="font-body text-base text-ivory/45">{videos.length}</span>
              </h2>
              <label className="relative block w-full sm:w-[320px]">
                <span className="sr-only">Search videos</span>
                <Search aria-hidden className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ivory/45" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShown(PAGE)
                  }}
                  placeholder="Search videos"
                  className="w-full rounded-full border border-line bg-ink py-3 pr-4 pl-11 font-body text-[15px] text-ivory outline-none placeholder:text-ivory/40 focus:border-gold"
                />
              </label>
            </div>

            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, shown).map((v) => {
                const active = v.youtubeId === selected.youtubeId
                const d = duration(v.durationSec)
                return (
                  <li key={v.id}>
                    <button type="button" onClick={() => pick(v)} className="group block w-full text-left" aria-current={active || undefined}>
                      <span
                        className={cn(
                          'relative block aspect-video overflow-hidden rounded-[18px] bg-ink ring-2 ring-transparent transition',
                          active && 'ring-gold'
                        )}
                      >
                        <Thumb
                          video={v}
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 380px"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-night opacity-0 transition-opacity group-hover:opacity-100">
                          <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
                        </span>
                        {active && (
                          <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 font-body text-xs font-semibold text-night">
                            Now playing
                          </span>
                        )}
                        {d && (
                          <span className="absolute right-3 bottom-3 rounded-md bg-black/75 px-2 py-0.5 font-body text-xs font-semibold text-white tabular-nums">
                            {d}
                          </span>
                        )}
                      </span>
                      <span className="mt-4 line-clamp-2 block font-body text-base font-semibold leading-snug text-ivory transition-colors group-hover:text-gold">
                        {v.title}
                      </span>
                      {v.publishedAt && <span className="mt-1 block font-body text-sm text-ivory/50">{date(v.publishedAt)}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>

            {filtered.length === 0 && <p className="py-12 text-center font-body text-ivory/60">No videos match “{query}”.</p>}

            {filtered.length > shown && (
              <div className="mt-14 text-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE)}
                  className="rounded-full border border-ivory/30 px-8 py-3.5 font-body text-[15px] font-semibold text-ivory transition-colors hover:border-gold hover:text-gold"
                >
                  Show more ({filtered.length - shown} left)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
