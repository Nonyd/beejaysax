'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { usePlayer } from '@/components/player/PlayerProvider'
import ConsentEmbed from '@/components/consent/ConsentEmbed'

export type HomeVideo = { id: string; title: string; thumbnail?: string | null }

function VideoCard({ video, large = false }: { video: HomeVideo; large?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const player = usePlayer()

  return (
    <div className="relative aspect-video overflow-hidden rounded-[28px] bg-night shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      {playing ? (
        <ConsentEmbed kind="youtube" className="absolute inset-0">
          <iframe
            title={video.title}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </ConsentEmbed>
      ) : (
        <button
          type="button"
          onClick={() => {
            // Don't play a video over a music preview
            if (player.playing) player.toggle()
            setPlaying(true)
          }}
          className="group absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
          aria-label={`Play video: ${video.title}`}
        >
          <Image
            src={video.thumbnail ?? `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
            alt=""
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width:1240px) 100vw, 1140px"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
          <span
            className={`absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-night transition-transform duration-300 group-hover:scale-110 ${
              large ? 'h-14 w-14 md:h-24 md:w-24' : 'h-14 w-14'
            }`}
          >
            <Play className={large ? 'ml-1 h-6 w-6 md:h-8 md:w-8' : 'ml-0.5 h-6 w-6'} fill="currentColor" aria-hidden />
          </span>
          <span className="absolute right-5 bottom-4 left-5 font-display text-[clamp(17px,2.6vw,34px)] leading-tight text-ivory md:right-10 md:bottom-8 md:left-10">
            {video.title}
          </span>
        </button>
      )}
    </div>
  )
}

export default function VideoSection({
  videos: VIDEOS,
  titleLines,
  linkLabel,
  linkUrl,
}: {
  videos: HomeVideo[]
  titleLines: string[]
  linkLabel: string
  linkUrl: string
}) {
  if (VIDEOS.length === 0) return null
  return (
    <section className="bg-night py-24 md:py-32">
      <div className="site-shell">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
            {titleLines.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 self-start md:self-auto">
            <Link
              href="/videos"
              className="rounded-full bg-gold px-6 py-3 font-body text-[15px] font-semibold text-night no-underline transition-colors hover:bg-gold-lt"
            >
              All videos
            </Link>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-base font-semibold text-gold underline decoration-gold/40 underline-offset-[6px] transition-colors hover:decoration-gold"
            >
              {linkLabel}
            </a>
          </div>
        </div>

        {/* Feature the first video only when the rest pair up evenly, so no half-empty row. */}
        {VIDEOS.length % 2 === 1 && (
          <div className={VIDEOS.length > 1 ? 'mb-6' : undefined}>
            <VideoCard video={VIDEOS[0]} large />
          </div>
        )}

        {VIDEOS.length > 1 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {VIDEOS.slice(VIDEOS.length % 2).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
