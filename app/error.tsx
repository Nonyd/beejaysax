'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Adire from '@/components/ui/Adire'

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      <Adire variant="field" color="#E3B23C" opacity={0.06} />
      <div className="relative max-w-lg text-center">
        <h1 className="font-display text-[clamp(48px,8vw,88px)] leading-[0.92] text-ivory">This page didn&apos;t load</h1>
        <p className="mx-auto mt-6 max-w-[42ch] font-body text-lg text-ivory/75">
          Something went wrong on our side. Try again, or head back to the home page.
        </p>
        {error.digest && <p className="mt-3 font-body text-sm text-ivory/45">Reference: {error.digest}</p>}
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-gold px-7 py-3.5 font-body text-[15px] font-semibold text-night transition-colors hover:bg-gold-lt"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-ivory/40 px-7 py-3.5 font-body text-[15px] font-semibold text-ivory no-underline transition-colors hover:border-gold hover:text-gold"
          >
            Go to home page
          </Link>
        </div>
      </div>
    </div>
  )
}
