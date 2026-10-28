'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff, Keyboard, Loader2 } from 'lucide-react'

type Result = {
  result: 'admitted' | 'already_used' | 'wrong_event' | 'cancelled' | 'not_found' | 'invalid' | 'error'
  message: string
  holder?: { name: string; ticketNumber: string; tier: string }
  usedAt?: string | null
  usedBy?: string | null
}

const TONE: Record<Result['result'], { bg: string; title: string }> = {
  admitted: { bg: 'bg-[#2f6b4f]', title: 'Admitted' },
  already_used: { bg: 'bg-[#b7791f]', title: 'Already checked in' },
  wrong_event: { bg: 'bg-[#a9452c]', title: 'Wrong event' },
  cancelled: { bg: 'bg-[#a9452c]', title: 'Not valid' },
  not_found: { bg: 'bg-[#a9452c]', title: 'Not found' },
  invalid: { bg: 'bg-[#a9452c]', title: 'Not a ticket' },
  error: { bg: 'bg-[#a9452c]', title: 'Could not check' },
}

/** Door scanner. Scans continuously; each result shows for a moment, then scanning resumes. */
export default function CheckinScanner({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [camera, setCamera] = useState<'off' | 'starting' | 'on' | 'error'>('off')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [stats, setStats] = useState<{ total: number; admitted: number } | null>(null)
  const [manual, setManual] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const pausedRef = useRef(false)
  const lastRef = useRef<{ code: string; at: number }>({ code: '', at: 0 })

  useEffect(() => {
    fetch(`/api/checkin/${eventId}`)
      .then((r) => r.json())
      .then((d) => d.stats && setStats(d.stats))
      .catch(() => {})
  }, [eventId])

  const check = useCallback(
    async (raw: string) => {
      pausedRef.current = true
      setBusy(true)
      try {
        const res = await fetch(`/api/checkin/${eventId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw }),
        })
        if (res.status === 401) {
          setResult({ result: 'error', message: 'Your check-in access has expired. Reload the page and sign in again.' })
          return
        }
        const data = (await res.json()) as Result & { stats?: { total: number; admitted: number } }
        setResult(data)
        if (data.stats) setStats(data.stats)
        navigator.vibrate?.(data.result === 'admitted' ? 80 : [60, 60, 60])
      } catch {
        setResult({ result: 'error', message: 'No connection. Check the network and scan again.' })
      } finally {
        setBusy(false)
        window.setTimeout(() => {
          pausedRef.current = false
        }, 2200)
      }
    },
    [eventId]
  )

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamera('off')
  }, [])

  useEffect(() => stop, [stop])

  async function start() {
    setCamera('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      setCamera('on')
      timerRef.current = window.setInterval(() => {
        const canvas = canvasRef.current
        if (pausedRef.current || !canvas || video.readyState < 2) return
        // Downscale for speed; QR codes on a phone screen are still readable at 480px.
        const scale = Math.min(1, 480 / video.videoWidth)
        canvas.width = video.videoWidth * scale
        canvas.height = video.videoHeight * scale
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
        if (!code?.data) return
        const now = Date.now()
        // Ignore the same code held in front of the camera.
        if (code.data === lastRef.current.code && now - lastRef.current.at < 4000) return
        lastRef.current = { code: code.data, at: now }
        void check(code.data)
      }, 180)
    } catch {
      setCamera('error')
    }
  }

  const tone = result ? TONE[result.result] : null

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-2xl text-ivory">{eventTitle}</p>
          <p className="font-body text-sm text-ivory/60">Door check-in</p>
        </div>
        {stats && (
          <p className="shrink-0 text-right font-body text-sm text-ivory/70">
            <span className="block font-display text-3xl leading-none text-gold">{stats.admitted}</span>
            of {stats.total} admitted
          </p>
        )}
      </div>

      <div className="relative aspect-square overflow-hidden rounded-[24px] bg-night">
        <video ref={videoRef} playsInline muted className={camera === 'on' ? 'h-full w-full object-cover' : 'hidden'} />
        <canvas ref={canvasRef} className="hidden" />
        {camera === 'on' && (
          <div aria-hidden className="pointer-events-none absolute inset-[18%] rounded-[20px] border-4 border-gold/80" />
        )}
        {camera !== 'on' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            {camera === 'error' ? (
              <>
                <CameraOff className="h-10 w-10 text-ivory/50" />
                <p className="font-body text-ivory/75">The camera couldn’t start. Allow camera access, or type the ticket number below.</p>
              </>
            ) : (
              <>
                <Camera className="h-10 w-10 text-gold" />
                <button
                  type="button"
                  onClick={start}
                  disabled={camera === 'starting'}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-body font-semibold text-night"
                >
                  {camera === 'starting' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start scanning
                </button>
              </>
            )}
          </div>
        )}
        {(result || busy) && (
          <div
            className={`absolute inset-x-0 bottom-0 p-5 text-ivory ${tone?.bg ?? 'bg-night/90'}`}
            role="status"
            aria-live="assertive"
          >
            {busy ? (
              <p className="flex items-center gap-2 font-body font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </p>
            ) : (
              result && (
                <>
                  <p className="font-display text-3xl leading-none">{tone!.title}</p>
                  {result.holder && (
                    <p className="mt-2 font-body text-lg font-semibold">
                      {result.holder.name} <span className="font-normal opacity-80">· {result.holder.tier}</span>
                    </p>
                  )}
                  <p className="mt-1 font-body text-sm opacity-90">
                    {result.result === 'already_used' && result.usedAt
                      ? `Checked in at ${new Date(result.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${result.usedBy ? ` by ${result.usedBy}` : ''}`
                      : result.result === 'admitted'
                        ? result.holder?.ticketNumber
                        : result.message}
                  </p>
                </>
              )
            )}
          </div>
        )}
      </div>

      {camera === 'on' && (
        <button type="button" onClick={stop} className="mt-3 font-body text-sm text-ivory/60 underline">
          Stop camera
        </button>
      )}

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (manual.trim()) void check(manual.trim()).then(() => setManual(''))
        }}
      >
        <label htmlFor="manual-code" className="sr-only">
          Ticket number
        </label>
        <div className="relative flex-1">
          <Keyboard aria-hidden className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ivory/45" />
          <input
            id="manual-code"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Type ticket number, e.g. BJS-2026-A6EF8F47"
            autoCapitalize="characters"
            className="w-full rounded-full border border-line bg-night py-3.5 pr-4 pl-11 font-body text-ivory outline-none placeholder:text-ivory/40 focus:border-gold"
          />
        </div>
        <button type="submit" disabled={busy || !manual.trim()} className="rounded-full bg-gold px-6 font-body font-semibold text-night disabled:opacity-50">
          Check
        </button>
      </form>
    </div>
  )
}
