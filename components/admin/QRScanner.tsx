'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'
import SectionLabel from '@/components/ui/SectionLabel'

type ScanState = 'idle' | 'scanning' | 'success' | 'used' | 'error'

interface ScanResult {
  attendee?: string
  ticketType?: string
  ticketNumber?: string
  eventTitle?: string
  usedAt?: string
  reason?: string
}

export default function QRScanner() {
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult>({})
  const [cameraError, setCameraError] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [countdown, setCountdown] = useState(3)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const verifyToken = useCallback(async (url: string) => {
    const parts = url.split('/')
    const token = parts[parts.length - 1]?.split('?')[0] ?? ''
    if (!token || token.length < 10) {
      setScanState('error')
      setResult({ reason: 'Invalid QR code format' })
      return
    }

    const adminKey = process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY ?? ''
    if (!adminKey) {
      setScanState('error')
      setResult({ reason: 'Scanner not configured (missing NEXT_PUBLIC_ADMIN_VERIFY_KEY)' })
      return
    }

    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(token)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey }),
      })
      const data = (await res.json()) as {
        valid?: boolean
        reason?: string
        error?: string
        attendee?: string
        ticketType?: string
        ticketNumber?: string
        eventTitle?: string
        usedAt?: string
      }

      if (data.valid) {
        setScanState('success')
        setResult({
          attendee: data.attendee,
          ticketType: data.ticketType,
          ticketNumber: data.ticketNumber,
          eventTitle: data.eventTitle,
        })
      } else if (data.reason === 'already_used') {
        setScanState('used')
        setResult({
          attendee: data.attendee,
          usedAt: data.usedAt,
          ticketType: data.ticketType,
          ticketNumber: data.ticketNumber,
          eventTitle: data.eventTitle,
        })
      } else {
        setScanState('error')
        setResult({ reason: data.error ?? 'Invalid ticket' })
      }
    } catch {
      setScanState('error')
      setResult({ reason: 'Network error — check connection' })
    }
  }, [])

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      stopCamera()
      void verifyToken(code.data)
    } else {
      animFrameRef.current = requestAnimationFrame(scanFrame)
    }
  }, [verifyToken, stopCamera])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        void videoRef.current.play()
      }
      setScanState('scanning')
      animFrameRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setCameraError('Camera not available. Use manual entry below.')
      setScanState('idle')
    }
  }

  function reset() {
    setScanState('idle')
    setResult({})
    setManualToken('')
    setCountdown(3)
  }

  async function handleManualVerify() {
    if (!manualToken.trim()) return
    const url = manualToken.includes('/') ? manualToken : `https://beejaysax.com/tickets/${manualToken.trim()}`
    await verifyToken(url)
  }

  useEffect(() => {
    if (scanState === 'success' || scanState === 'used' || scanState === 'error') {
      setCountdown(3)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            reset()
            return 3
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [scanState])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B]">
      <div className="border-b border-[rgba(247,241,227,0.12)] px-6 py-4">
        <SectionLabel>QR Ticket Scanner</SectionLabel>
      </div>

      <div className="p-8">
        {scanState === 'idle' && (
          <div className="mx-auto max-w-sm text-center">
            <div style={{ fontSize: 64, marginBottom: 16 }}>⬛</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F7F1E3', marginBottom: 8 }}>
              Ticket Scanner
            </h3>
            <p style={{ color: 'rgba(247,241,227,0.55)', fontSize: 14, marginBottom: 32 }}>
              Point camera at a guest&apos;s QR code to admit them
            </p>

            {cameraError && (
              <p
                style={{
                  color: '#f87171',
                  fontSize: 13,
                  marginBottom: 16,
                  background: 'rgba(127,29,29,0.2)',
                  border: '1px solid rgba(127,29,29,0.4)',
                  padding: '8px 16px',
                }}
              >
                {cameraError}
              </p>
            )}

            <button
              type="button"
              onClick={startCamera}
              className="mb-6 w-full bg-[#E3B23C] px-8 py-3 font-semibold text-[#11142F] transition hover:bg-[#F0C75E]"
              style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              Start Camera Scanner
            </button>

            <div style={{ borderTop: '1px solid rgba(247,241,227,0.12)', paddingTop: 24 }}>
              <p
                style={{
                  color: 'rgba(247,241,227,0.45)',
                  fontSize: 12,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Or enter ticket token manually
              </p>
              <div className="flex gap-2">
                <input
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void handleManualVerify()}
                  placeholder="Paste QR token or URL..."
                  className="flex-1 border border-[rgba(247,241,227,0.2)] bg-[#20255A] px-3 py-2.5 text-sm text-white focus:border-[#E3B23C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void handleManualVerify()}
                  disabled={!manualToken.trim()}
                  className="border border-[#E3B23C] px-4 py-2.5 text-xs text-[#E3B23C] transition hover:bg-[#E3B23C] hover:text-[#11142F] disabled:opacity-40"
                  style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="text-center">
            <div className="relative inline-block w-full max-w-[400px]">
              <video ref={videoRef} className="w-full bg-black" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                <div
                  key={pos}
                  className={`absolute ${pos}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderTop: i < 2 ? '3px solid #E3B23C' : 'none',
                    borderBottom: i >= 2 ? '3px solid #E3B23C' : 'none',
                    borderLeft: i % 2 === 0 ? '3px solid #E3B23C' : 'none',
                    borderRight: i % 2 === 1 ? '3px solid #E3B23C' : 'none',
                  }}
                />
              ))}
            </div>
            <p
              style={{
                color: '#E3B23C',
                fontSize: 13,
                marginTop: 16,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Scanning...
            </p>
            <button
              type="button"
              onClick={() => {
                stopCamera()
                setScanState('idle')
              }}
              className="mt-4 border border-[rgba(247,241,227,0.2)] px-6 py-2 text-xs text-[rgba(247,241,227,0.55)] transition hover:border-[rgba(247,241,227,0.55)] hover:text-white"
              style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Stop Scanner
            </button>
          </div>
        )}

        {scanState === 'success' && (
          <div className="mx-auto max-w-sm py-8 text-center">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(20,83,45,0.3)',
                border: '2px solid #4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: 36,
              }}
            >
              ✓
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, color: '#4ade80', margin: '16px 0 8px' }}>
              ADMIT
            </h3>
            <p style={{ fontSize: 20, color: '#F7F1E3', fontWeight: 600 }}>{result.attendee}</p>
            <p style={{ fontSize: 14, color: 'rgba(247,241,227,0.7)', marginTop: 4 }}>
              {result.ticketType} · {result.ticketNumber}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.55)', marginTop: 4 }}>{result.eventTitle}</p>
            <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.45)', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}

        {scanState === 'used' && (
          <div className="mx-auto max-w-sm py-8 text-center">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(127,29,29,0.3)',
                border: '2px solid #f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: 36,
              }}
            >
              ✕
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#f87171', margin: '16px 0 8px' }}>
              ALREADY ADMITTED
            </h3>
            <p style={{ fontSize: 16, color: '#F7F1E3' }}>{result.attendee}</p>
            {result.usedAt && (
              <p style={{ fontSize: 13, color: 'rgba(247,241,227,0.7)', marginTop: 4 }}>
                Admitted at: {new Date(result.usedAt).toLocaleString('en-NG')}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.45)', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}

        {scanState === 'error' && (
          <div className="mx-auto max-w-sm py-8 text-center">
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(120,53,15,0.3)',
                border: '2px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: 36,
              }}
            >
              ⚠
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#f59e0b', margin: '16px 0 8px' }}>
              INVALID TICKET
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(247,241,227,0.7)' }}>{result.reason ?? 'This QR code is not valid'}</p>
            <p style={{ fontSize: 12, color: 'rgba(247,241,227,0.45)', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}
      </div>
    </div>
  )
}
