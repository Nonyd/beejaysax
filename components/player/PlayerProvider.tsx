'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { PreviewRelease, PreviewTrack } from '@/lib/previews'

type PlayerContextValue = {
  current: PreviewTrack | null
  release: PreviewRelease | null
  playing: boolean
  progress: number
  duration: number
  open: boolean
  playTrack: (track: PreviewTrack, release: PreviewRelease) => void
  playRelease: (release: PreviewRelease) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (ratio: number) => void
  close: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

function neighbour(release: PreviewRelease, currentId: string, step: 1 | -1) {
  const playable = release.tracks.filter((t) => t.previewUrl)
  const i = playable.findIndex((t) => t.id === currentId)
  return i < 0 ? (playable[0] ?? null) : (playable[i + step] ?? null)
}

/**
 * One audio element for the whole public site, so a preview keeps playing while visitors
 * move between pages. Plays 30-second clips track after track through a release.
 */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<PreviewTrack | null>(null)
  const [release, setRelease] = useState<PreviewRelease | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const playTrack = useCallback((track: PreviewTrack, rel: PreviewRelease) => {
    const audio = audioRef.current
    if (!audio || !track.previewUrl) return
    setCurrent(track)
    setRelease(rel)
    setProgress(0)
    if (audio.src !== track.previewUrl) audio.src = track.previewUrl
    audio.play().catch(() => setPlaying(false))
  }, [])

  const playRelease = useCallback(
    (rel: PreviewRelease) => {
      const first = rel.tracks.find((t) => t.previewUrl)
      if (first) playTrack(first, rel)
    },
    [playTrack]
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [current])

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current || !release) return
      const n = neighbour(release, current.id, dir)
      if (n) playTrack(n, release)
    },
    [current, release, playTrack]
  )

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return
    const r = Math.min(1, Math.max(0, ratio))
    audio.currentTime = r * audio.duration
    setProgress(r)
  }, [])

  const close = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setPlaying(false)
    setCurrent(null)
    setRelease(null)
    setProgress(0)
    setDuration(0)
  }, [])

  // The "ended" handler needs the latest track and release without re-binding listeners.
  const latest = useRef({ current, release, playTrack })
  useEffect(() => {
    latest.current = { current, release, playTrack }
  })

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
      setProgress(audio.currentTime / audio.duration)
      setDuration(audio.duration)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      const { current: cur, release: rel, playTrack: play } = latest.current
      const n = cur && rel ? neighbour(rel, cur.id, 1) : null
      if (n && rel) play(n, rel)
      else setProgress(1)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const value: PlayerContextValue = {
    current,
    release,
    playing,
    progress,
    duration,
    open: current !== null,
    playTrack,
    playRelease,
    toggle,
    next: () => step(1),
    prev: () => step(-1),
    seek,
    close,
  }

  return (
    <PlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="none" aria-label={current ? `Preview: ${current.title}` : 'Track preview player'} />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
