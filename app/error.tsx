'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4">
      <div className="max-w-md text-center">
        <p className="section-label mb-6">Something went wrong</p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(48px, 8vw, 80px)',
            color: '#F5F0E8',
            lineHeight: 0.9,
            marginBottom: 24,
          }}
        >
          An error
          <br />
          <em style={{ color: '#C9A84C' }}>occurred.</em>
        </h1>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 40 }}>
          Something unexpected happened. This has been noted.
          {error.digest && (
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: '#333', marginTop: 8 }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-[#C9A84C] px-6 py-3 font-semibold text-[#080808] transition hover:bg-[#E8C96D]"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#2A2A2A] px-6 py-3 text-white transition hover:border-[#C9A84C]"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
