'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="no-print fixed right-6 bottom-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-gold text-night shadow-[0_8px_24px_color-mix(in srgb, var(--night) 45%, transparent)] transition-colors hover:bg-gold-lt md:right-8 md:bottom-8"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  )
}
