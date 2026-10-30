'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'
import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { formatTime, usePlayer } from './PlayerProvider'
import { cn } from '@/lib/utils'

/** A soft sound wave, drawn twice: dim underneath, gold on top clipped to the progress. */
const WAVE = 'M0 10 C60 2 90 18 150 10 S240 2 300 10 S390 18 450 10 S540 2 600 10 S690 18 750 10 S840 2 900 10 S990 18 1050 10 S1140 2 1200 10'

function Wave({ progress, onSeek }: { progress: number; onSeek: (r: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const clip = useId().replace(/:/g, '')
  const pct = Math.min(100, Math.max(0, progress * 100))

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      tabIndex={0}
      onClick={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (r && r.width > 0) onSeek((e.clientX - r.left) / r.width)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onSeek(progress + 0.05)
        if (e.key === 'ArrowLeft') onSeek(progress - 0.05)
      }}
      className="relative h-8 w-full cursor-pointer"
    >
      <svg viewBox="0 0 1200 20" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
        <defs>
          <clipPath id={clip}>
            <rect x="0" y="0" width={(1200 * pct) / 100} height="20" />
          </clipPath>
        </defs>
        <path d={WAVE} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-ivory/20" />
        <path d={WAVE} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-gold" clipPath={`url(#${clip})`} />
      </svg>
    </div>
  )
}

/** Three little bars that bounce while a preview plays. */
function Equalizer({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="inline-flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((d) => (
        <span
          key={d}
          className="w-[3px] rounded-sm bg-gold"
          style={{ height: on ? undefined : 4, animation: on ? `eq 0.9s ease-in-out ${d}s infinite` : 'none' }}
        />
      ))}
    </span>
  )
}

function Control({ label, onClick, children, primary }: { label: string; onClick: () => void; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
        primary ? 'h-11 w-11 bg-gold text-night hover:bg-gold-lt' : 'h-10 w-10 text-ivory/75 hover:text-gold'
      )}
    >
      {children}
    </button>
  )
}

/** The bar pinned to the bottom of the screen while a preview is loaded. */
export default function MiniPlayer() {
  const { open, current, release, playing, progress, duration, toggle, next, prev, seek, close } = usePlayer()

  // Lift the back-to-top button and pad the page so the bar never covers content.
  useEffect(() => {
    const root = document.documentElement
    if (open) root.style.setProperty('--player-offset', '76px')
    else root.style.removeProperty('--player-offset')
    return () => {
      root.style.removeProperty('--player-offset')
    }
  }, [open])

  if (!open || !current) return null

  const index = release ? release.tracks.findIndex((t) => t.id === current.id) : -1

  return (
    <div
      role="region"
      aria-label="Track preview player"
      onKeyDown={(e) => {
        if (e.key === ' ' && e.target === e.currentTarget) {
          e.preventDefault()
          toggle()
        }
      }}
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-[110] h-[76px] border-t border-line bg-night/95 text-ivory backdrop-blur-md"
      style={{ animation: 'fadeUp 0.35s ease both' }}
    >
      {/* Phones: the wave runs along the top edge */}
      <div className="absolute inset-x-0 -top-4 px-4 md:hidden">
        <Wave progress={progress} onSeek={seek} />
      </div>

      <div className="site-shell flex h-full items-center gap-3 md:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-[340px]">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-ink">
            {release?.coverImage ? (
              <Image src={release.coverImage} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-xl text-gold">♪</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-body text-sm font-semibold">
              <Equalizer on={playing} />
              <span className="truncate">{current.title}</span>
            </p>
            <p className="truncate font-body text-xs text-ivory/55">
              {release?.title}
              {index >= 0 && release && release.tracks.length > 1 ? ` · ${index + 1} of ${release.tracks.length}` : ''}
              {' · Preview'}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
          <span className="w-10 text-right font-body text-xs text-ivory/55 tabular-nums">{formatTime(duration * progress)}</span>
          <Wave progress={progress} onSeek={seek} />
          <span className="w-10 font-body text-xs text-ivory/55 tabular-nums">{formatTime(duration || 30)}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <Control label="Previous track" onClick={prev}>
            <SkipBack aria-hidden className="h-4 w-4 fill-current" />
          </Control>
          <Control label={playing ? 'Pause' : 'Play'} onClick={toggle} primary>
            {playing ? <Pause aria-hidden className="h-4 w-4 fill-current" /> : <Play aria-hidden className="ml-0.5 h-4 w-4 fill-current" />}
          </Control>
          <Control label="Next track" onClick={next}>
            <SkipForward aria-hidden className="h-4 w-4 fill-current" />
          </Control>
          <Control label="Close player" onClick={close}>
            <X aria-hidden className="h-4 w-4" />
          </Control>
        </div>
      </div>
    </div>
  )
}
