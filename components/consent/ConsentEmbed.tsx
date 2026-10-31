'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useConsent } from '@/components/consent/consent'

const COPY = {
  youtube: { text: 'This video is hosted by YouTube, which may set cookies.', load: 'Load video' },
  maps: { text: 'This map is from Google Maps, which may set cookies.', load: 'Load map' },
}

/**
 * Wraps a third-party iframe. Until the visitor allows media embeds, a placeholder of the same
 * size explains who the content is from and offers to load it once (this page only) or always.
 * `className` sizes the placeholder; it should match how the iframe is laid out.
 */
export default function ConsentEmbed({
  kind,
  className = 'h-full w-full',
  children,
}: {
  kind: keyof typeof COPY
  className?: string
  children: React.ReactNode
}) {
  const { media, save } = useConsent()
  const [once, setOnce] = useState(false)
  if (media || once) return <>{children}</>

  const c = COPY[kind]
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 bg-ink p-6 text-center', className)}>
      <p className="max-w-[40ch] font-body text-[15px] leading-relaxed text-ivory/80">
        {c.text}{' '}
        <Link href="/cookies" className="font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
          Learn more
        </Link>
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={() => setOnce(true)}
          className="rounded-full bg-gold px-5 py-2.5 font-body text-sm font-semibold text-night transition-colors hover:bg-gold-lt"
        >
          {c.load}
        </button>
        <button
          type="button"
          onClick={() => save({ media: true })}
          className="rounded-full border border-gold/70 px-5 py-2.5 font-body text-sm font-semibold text-ivory transition-colors hover:bg-gold hover:text-night"
        >
          Always allow
        </button>
      </div>
    </div>
  )
}
