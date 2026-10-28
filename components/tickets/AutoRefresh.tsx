'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Re-runs the server component every few seconds (stops after ~2 minutes). */
export default function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter()
  useEffect(() => {
    let n = 0
    const id = window.setInterval(() => {
      if (++n > Math.ceil(120 / seconds)) window.clearInterval(id)
      else router.refresh()
    }, seconds * 1000)
    return () => window.clearInterval(id)
  }, [router, seconds])
  return null
}
