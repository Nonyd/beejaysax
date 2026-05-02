'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Release } from '@prisma/client'
import { ReleaseType } from '@prisma/client'
import { format } from 'date-fns'

type Filter = 'ALL' | ReleaseType

const TABS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Singles', value: 'SINGLE' },
  { label: 'Albums', value: 'ALBUM' },
  { label: 'EPs', value: 'EP' },
]

function StreamTextLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        color: '#333',
        textDecoration: 'none',
        transition: 'color 200ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#C9A84C'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#333'
      }}
    >
      {label}
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
      <div
        className="sticky z-30 border-b"
        style={{ top: 72, background: '#080808', borderColor: '#1E1E1E' }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap px-6 md:px-12">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setFilter(t.value)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '16px 16px',
                border: 'none',
                borderBottom: filter === t.value ? '2px solid #C9A84C' : '2px solid transparent',
                background: 'transparent',
                color: filter === t.value ? '#C9A84C' : '#555',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((r) => (
            <Link key={r.id} href={`/releases/${r.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{
                  background: '#0F0F0F',
                  border: '1px solid #1E1E1E',
                  overflow: 'hidden',
                  transition: 'all 300ms ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E1E'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                  {r.coverImage ? (
                    <Image
                      src={r.coverImage}
                      alt={`${r.title} — album cover`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width:768px) 50vw, 25vw"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1a1204, #0d0a02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(11px,2.8vw,15px)',
                          fontWeight: 600,
                          textAlign: 'center',
                          color: '#C9A84C',
                        }}
                      >
                        {r.title}
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      border: '1px solid rgba(201,168,76,0.3)',
                      padding: '3px 10px',
                      display: 'inline-block',
                      marginBottom: 8,
                    }}
                  >
                    {r.releaseType}
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#F5F0E8',
                      margin: '0 0 4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.title}
                  </p>
                  {r.releaseDate && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#444', margin: 0 }}>
                      {format(r.releaseDate, 'MMM yyyy')}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                    <StreamTextLink href={r.spotifyUrl} label="Spotify" />
                    <StreamTextLink href={r.appleMusicUrl} label="Apple" />
                    <StreamTextLink href={r.audiomackUrl} label="Audiomack" />
                    <StreamTextLink href={r.youtubeUrl} label="YouTube" />
                    <StreamTextLink href={r.boomplayUrl} label="Boomplay" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555' }}>No releases in this category.</p>
        )}
      </section>
    </>
  )
}
