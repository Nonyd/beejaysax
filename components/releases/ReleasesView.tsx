'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Release } from '@prisma/client'
import { ReleaseType } from '@prisma/client'
import { format } from 'date-fns'
import FilterPills from '@/components/ui/FilterPills'
import RecordSleeve from '@/components/ui/RecordSleeve'

type Filter = 'ALL' | ReleaseType

const TYPE_LABEL: Record<ReleaseType, string> = { ALBUM: 'Album', SINGLE: 'Single', EP: 'EP' }

const STREAMS = [
  ['spotifyUrl', 'Spotify'],
  ['appleMusicUrl', 'Apple Music'],
  ['audiomackUrl', 'Audiomack'],
  ['youtubeUrl', 'YouTube'],
  ['boomplayUrl', 'Boomplay'],
] as const

export default function ReleasesView({ releases }: { releases: Release[] }) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const filtered = useMemo(
    () => (filter === 'ALL' ? releases : releases.filter((r) => r.releaseType === filter)),
    [releases, filter]
  )

  const count = (t: ReleaseType) => releases.filter((r) => r.releaseType === t).length
  const options = [
    { label: 'All', value: 'ALL' as Filter, count: releases.length },
    ...(['ALBUM', 'SINGLE', 'EP'] as ReleaseType[])
      .filter((t) => count(t) > 0)
      .map((t) => ({ label: `${TYPE_LABEL[t]}s`, value: t as Filter, count: count(t) })),
  ]

  return (
    <section className="bg-night py-16 md:py-24">
      <div className="site-shell">
        {releases.length > 0 && <FilterPills label="Filter releases" options={options} value={filter} onChange={setFilter} />}

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const streams = STREAMS.filter(([key]) => r[key])
            return (
              <article key={r.id} className="group min-w-0">
                <Link href={`/releases/${r.slug}`} className="block no-underline">
                  <RecordSleeve
                    title={r.title}
                    coverImage={r.coverImage}
                    sizes="(max-width:640px) 80vw, (max-width:1024px) 40vw, 320px"
                    className="transition-transform duration-500 group-hover:-translate-y-1"
                  />
                  <p className="mt-6 font-body text-sm font-semibold text-gold">
                    {TYPE_LABEL[r.releaseType]}
                    {r.releaseDate ? `, ${format(r.releaseDate, 'yyyy')}` : ''}
                  </p>
                  <h2 className="mt-1 font-display text-[30px] leading-[1.05] text-ivory transition-colors group-hover:text-gold">
                    {r.title}
                  </h2>
                </Link>
                {streams.length > 0 && (
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-body text-sm">
                    {streams.map(([key, label]) => (
                      <a
                        key={key}
                        href={r[key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ivory/65 underline decoration-ivory/25 underline-offset-4 hover:text-gold hover:decoration-gold"
                      >
                        {label}
                      </a>
                    ))}
                  </p>
                )}
              </article>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display text-3xl text-ivory">Music is on the way</p>
            <p className="mt-3 font-body text-base text-ivory/65">New releases will appear here as soon as they drop.</p>
          </div>
        )}
      </div>
    </section>
  )
}
