'use client'

import { Pause, Play } from 'lucide-react'
import { hasPreview, type PreviewRelease } from '@/lib/previews'
import { formatTime, usePlayer } from './PlayerProvider'
import { cn } from '@/lib/utils'

/** "Preview" button: plays the release's clips from the first track, or pauses if it's already playing. */
export function PreviewButton({ release, className }: { release: PreviewRelease; className?: string }) {
  const { release: active, playing, playRelease, toggle } = usePlayer()
  if (!hasPreview(release)) return null
  const isThis = active?.id === release.id

  return (
    <button
      type="button"
      onClick={() => (isThis ? toggle() : playRelease(release))}
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-body text-sm font-semibold text-night transition-colors hover:bg-gold-lt',
        className
      )}
    >
      {isThis && playing ? <Pause aria-hidden className="h-3.5 w-3.5 fill-current" /> : <Play aria-hidden className="h-3.5 w-3.5 fill-current" />}
      {isThis && playing ? 'Pause' : 'Preview'}
    </button>
  )
}

/** Numbered track list; each row with a clip plays it in the mini player. */
export function Tracklist({ release, className }: { release: PreviewRelease; className?: string }) {
  const { current, playing, playTrack, toggle } = usePlayer()
  if (release.tracks.length === 0) return null

  return (
    <ol className={cn('divide-y divide-line border-y border-line', className)}>
      {release.tracks.map((t) => {
        const active = current?.id === t.id
        return (
          <li key={t.id}>
            <button
              type="button"
              disabled={!t.previewUrl}
              onClick={() => (active ? toggle() : playTrack(t, release))}
              aria-label={t.previewUrl ? `${active && playing ? 'Pause' : 'Play'} ${t.title}` : `${t.title} (no preview)`}
              className="group flex w-full items-center gap-4 py-3.5 text-left disabled:cursor-default"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line font-body text-xs text-ivory/60 tabular-nums transition-colors group-enabled:group-hover:border-gold group-enabled:group-hover:text-gold">
                {active && playing ? (
                  <Pause aria-hidden className="h-3.5 w-3.5 fill-current text-gold" />
                ) : t.previewUrl ? (
                  <>
                    <span className="group-hover:hidden">{t.trackNumber}</span>
                    <Play aria-hidden className="hidden h-3.5 w-3.5 fill-current group-hover:block" />
                  </>
                ) : (
                  t.trackNumber
                )}
              </span>
              <span className={cn('min-w-0 flex-1 truncate font-body text-[15px]', active ? 'text-gold' : 'text-ivory')}>{t.title}</span>
              <span className="font-body text-sm text-ivory/50 tabular-nums">{t.durationMs ? formatTime(t.durationMs / 1000) : ''}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
