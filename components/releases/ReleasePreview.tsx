'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import type { Player } from '@/lib/embeds'
import { cn } from '@/lib/utils'

const PREF_KEY = 'bjs-player'

/** Remembers whether the visitor last listened on Spotify or Apple Music. */
function preferred(players: Player[]) {
  try {
    const saved = localStorage.getItem(PREF_KEY)
    return players.find((p) => p.service === saved) ?? players[0]
  } catch {
    return players[0]
  }
}

/**
 * Embedded Spotify / Apple Music player with a switch between the two
 * (only the services this release is on).
 */
export function ReleasePlayer({ players, title, className }: { players: Player[]; title: string; className?: string }) {
  const [active, setActive] = useState<Player | null>(null)
  const current = active ?? players[0]

  useEffect(() => {
    // Read the saved choice after mount so the server HTML matches the first render.
    const p = preferred(players)
    if (p !== players[0]) queueMicrotask(() => setActive(p))
  }, [players])

  if (!current) return null

  function choose(p: Player) {
    setActive(p)
    try {
      localStorage.setItem(PREF_KEY, p.service)
    } catch {
      // the choice just isn't remembered
    }
  }

  return (
    <div className={className}>
      {players.length > 1 && (
        <div role="tablist" aria-label="Listen on" className="mb-4 inline-flex rounded-full border border-line p-1">
          {players.map((p) => (
            <button
              key={p.service}
              type="button"
              role="tab"
              aria-selected={p.service === current.service}
              onClick={() => choose(p)}
              className={cn(
                'rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors',
                p.service === current.service ? 'bg-gold text-night' : 'text-ivory/70 hover:text-ivory'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <iframe
        key={current.src}
        title={`${title} on ${current.label}`}
        src={current.src}
        height={current.height}
        loading="lazy"
        allow="autoplay *; clipboard-write; encrypted-media *; fullscreen *; picture-in-picture"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        className="block w-full overflow-hidden rounded-[14px] border-0 bg-ink"
      />
    </div>
  )
}

/** A "Preview" button that opens the player in a dialog (used on the music list). */
export function PreviewButton({ players, title }: { players: Player[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  if (players.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          dialog.current?.showModal()
        }}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-body text-sm font-semibold text-night transition-colors hover:bg-gold-lt"
      >
        <Play aria-hidden className="h-3.5 w-3.5 fill-current" />
        Preview
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label={`Preview ${title}`}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[24px] border border-line bg-night p-0 text-ivory backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <p className="min-w-0 font-display text-2xl leading-tight">{title}</p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close preview"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line hover:border-gold hover:text-gold"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          {/* Only mount the iframe while open, so closing stops the music */}
          {open && <ReleasePlayer players={players} title={title} />}
        </div>
      </dialog>
    </>
  )
}
