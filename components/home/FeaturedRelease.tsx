'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { Release } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import { Music } from 'lucide-react'
import { registerGSAP, scaleInOnScroll } from '@/lib/animations'
import { format } from 'date-fns'

export default function FeaturedRelease({ release }: { release: Release | null }) {
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (coverRef.current) scaleInOnScroll(coverRef.current)
  }, [])

  if (!release) return null

  return (
    <section className="bg-bjs-surface py-32">
      <div className="mx-auto max-w-7xl px-8">
        <SectionLabel className="mb-12">Latest Release</SectionLabel>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
          <div ref={coverRef} className="relative aspect-square overflow-hidden lg:col-span-2">
            {release.coverImage ? (
              <Image
                src={release.coverImage}
                alt={`${release.title} — album cover`}
                fill
                className="object-cover transition-transform duration-[600ms] hover:scale-[1.03]"
                sizes="(max-width:1024px) 100vw, 40vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bjs-surface2">
                <Music className="h-24 w-24 text-bjs-gold/30" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center px-0 py-12 lg:col-span-3 lg:px-12 lg:py-16">
            <span className="inline-flex w-fit rounded border border-bjs-gold bg-bjs-gold-dim px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-bjs-gold">
              {release.releaseType}
            </span>
            <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold leading-[0.95] text-bjs-white">{release.title}</h2>
            <span className="gold-rule my-8 block" />
            <p className="line-clamp-3 font-sans text-base leading-[1.75] text-bjs-white/70">{release.description}</p>
            {release.releaseDate && (
              <p className="mt-4 font-sans text-[13px] text-bjs-muted">{format(release.releaseDate, 'MMMM d, yyyy')}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { url: release.spotifyUrl, label: 'Spotify' },
                { url: release.appleMusicUrl, label: 'Apple Music' },
                { url: release.audiomackUrl, label: 'Audiomack' },
                { url: release.youtubeUrl, label: 'YouTube' },
                { url: release.boomplayUrl, label: 'Boomplay' },
              ]
                .filter((p): p is { url: string; label: string } => !!p.url)
                .map((p) => (
                  <a
                    key={p.label}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-bjs-border bg-bjs-black px-4 py-2 font-sans text-[11px] uppercase tracking-wide text-bjs-gold transition-colors hover:border-bjs-gold"
                  >
                    {p.label}
                  </a>
                ))}
            </div>

            <Link href={`/releases/${release.slug}`} className="mt-10 inline-block font-sans text-sm text-bjs-gold underline-offset-4 hover:underline">
              More About This Release →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
