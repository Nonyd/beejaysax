'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { Release } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import { Music } from 'lucide-react'
import { registerGSAP, scaleInOnScroll } from '@/lib/animations'
import { format } from 'date-fns'
import { bodyTextStyle, goldRuleStyle, h2TextStyle, sectionLabelStyle } from '@/lib/typography-styles'

export default function FeaturedRelease({ release }: { release: Release | null }) {
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (coverRef.current) scaleInOnScroll(coverRef.current)
  }, [])

  if (!release) return null

  return (
    <section className="border-y border-bjs-border bg-bjs-surface py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <SectionLabel>Latest Release</SectionLabel>

        <div className="mt-12 grid grid-cols-1 gap-0 lg:grid-cols-5">
          <div ref={coverRef} className="relative aspect-square overflow-hidden lg:col-span-2">
            {release.coverImage ? (
              <Image
                src={release.coverImage}
                alt={`${release.title} — album cover`}
                fill
                className="object-cover transition-transform duration-[600ms] ease-out hover:scale-[1.03]"
                sizes="(max-width:1024px) 100vw, 40vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bjs-surface2">
                <Music className="h-24 w-24 text-bjs-gold/30" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center px-0 py-8 lg:col-span-3 lg:px-14 lg:py-0">
            <span className="inline-block w-fit border border-[rgba(201,168,76,0.3)] px-3 py-1 font-sans text-[9px] uppercase tracking-[0.2em] text-bjs-gold">
              {release.releaseType}
            </span>
            <h2 className="mt-4 text-bjs-white" style={h2TextStyle}>
              {release.title}
            </h2>
            <span className="my-5 block" style={goldRuleStyle} />
            <p className="line-clamp-3" style={bodyTextStyle}>
              {release.description}
            </p>
            {release.releaseDate && (
              <p className="mt-4 font-sans text-[13px] text-bjs-muted">{format(release.releaseDate, 'MMMM d, yyyy')}</p>
            )}

            <p className="mb-3 mt-8" style={sectionLabelStyle}>
              Stream Now
            </p>
            <div className="flex flex-wrap gap-3">
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
                    className="flex items-center gap-2 border border-bjs-border px-4 py-2.5 font-sans text-[11px] text-bjs-white transition-all duration-200 hover:border-bjs-gold hover:bg-bjs-gold/5"
                  >
                    {p.label}
                  </a>
                ))}
            </div>

            <Link
              href={`/releases/${release.slug}`}
              className="group/fr mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-bjs-gold transition-colors hover:text-bjs-gold-lt"
            >
              More About This Release{' '}
              <span className="transition-transform duration-300 group-hover/fr:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
