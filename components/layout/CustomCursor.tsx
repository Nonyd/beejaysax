'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const interactive = useRef(false)
  const [useCursor, setUseCursor] = useState(false)
  const [visible, setVisible] = useState(false)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setUseCursor(true)
    }
  }, [])

  useEffect(() => {
    if (!useCursor) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
      const el = document.elementFromPoint(e.clientX, e.clientY)
      interactive.current = !!(el && el.closest('a, button, [data-cursor]'))
      setVisible(true)
    }

    const onLeaveWin = () => setVisible(false)

    let rafId = 0
    const loop = () => {
      const int = interactive.current
      current.current.x += (target.current.x - current.current.x) * 0.1
      current.current.y += (target.current.y - current.current.y) * 0.1
      dot.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%) scale(${int ? 0 : 1})`
      dot.style.opacity = int ? '0' : '1'
      ring.style.transform = `translate(${current.current.x}px, ${current.current.y}px) translate(-50%, -50%) scale(${int ? 1.8 : 1})`
      ring.style.backgroundColor = int ? 'rgba(201, 168, 76, 0.1)' : 'transparent'
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeaveWin)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeaveWin)
    }
  }, [useCursor])

  if (!useCursor) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-2 w-2 rounded-full bg-bjs-gold"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-9 w-9 rounded-full border border-bjs-gold transition-[transform] duration-100 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  )
}
