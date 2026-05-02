'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Release } from '@prisma/client'
import { ReleaseType } from '@prisma/client'
import { format } from 'date-fns'
import { Music } from 'lucide-react'

type Filter = 'ALL' | ReleaseType

const TABS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Singles', value: 'SINGLE' },
  { label: 'Albums', value: 'ALBUM' },
  { label: 'EPs', value: 'EP' },
]

function StreamIcon({ href, label }: { href: string | null; label: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-bjs-border-lt transition-colors duration-200 hover:text-bjs-gold"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <Music className="h-4 w-4" aria-hidden />
    </a>
  )
}

export default function ReleasesView({ releases }: { releases: Release[] }) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const filtered = useMemo(() => {
    if (filter === 'ALL') return releases
    return releases.filter((r) => r.releaseType === filter)
  }, [releases, filter])

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-bjs-border bg-bjs-black">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-0 px-6 md:px-8 lg:px-12">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setFilter(t.value)}
              className={`border-b-2 px-4 py-4 font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 md:px-6 ${
                filter === t.value
                  ? 'border-bjs-gold text-bjs-gold'
                  : 'border-transparent text-bjs-muted hover:text-bjs-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((r) => (
            <Link key={r.id} href={`/releases/${r.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden border border-bjs-border bg-bjs-surface">
                {r.coverImage ? (
                  <Image
                    src={r.coverImage}
                    alt={`${r.title} — album cover`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Music className="h-12 w-12 text-bjs-gold/25" />
                  </div>
                )}
                <span className="absolute left-2 top-2 border border-[rgba(201,168,76,0.3)] bg-[rgba(8,8,8,0.85)] px-2 py-1 font-sans text-[9px] uppercase tracking-[0.1em] text-bjs-gold backdrop-blur-sm">
                  {r.releaseType}
                </span>
              </div>
              <p className="mt-3 line-clamp-1 font-serif text-base font-medium text-bjs-white">{r.title}</p>
              {r.releaseDate && (
                <p className="mt-1 font-sans text-[11px] text-bjs-muted">{format(r.releaseDate, 'MMM yyyy')}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                <StreamIcon href={r.spotifyUrl} label="Spotify" />
                <StreamIcon href={r.appleMusicUrl} label="Apple Music" />
                <StreamIcon href={r.audiomackUrl} label="Audiomack" />
                <StreamIcon href={r.youtubeUrl} label="YouTube" />
                <StreamIcon href={r.boomplayUrl} label="Boomplay" />
              </div>
              <p className="mt-2 font-sans text-[10px] font-medium uppercase tracking-wide text-bjs-gold">More Info →</p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <p className="font-sans text-bjs-muted">No releases in this category.</p>}
      </section>
    </>
  )
}
