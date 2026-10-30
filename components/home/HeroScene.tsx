'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import s from './Hero.module.css'

/** The hero <section>: feeds --scroll and pointer position (--mx/--my) to the CSS parallax. */
export function HeroScene({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight))
        el.style.setProperty('--scroll', p.toFixed(3))
      })
    }
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (finePointer) el.addEventListener('pointermove', onPointer)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}

const NOTES = ['♪', '♫', '♬', '♩']

/** The cutout figure. Tapping him makes him hop and throws notes out of the saxophone bell. */
export function Leaper({ src, alt }: { src: string; alt: string }) {
  const button = useRef<HTMLButtonElement>(null)
  const bell = useRef<HTMLSpanElement>(null)

  function hop() {
    const b = button.current
    const origin = bell.current
    if (!b || !origin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    b.classList.remove(s.hop)
    void b.offsetWidth // restart the animation on repeat taps
    b.classList.add(s.hop)

    for (let i = 0; i < 9; i++) {
      const n = document.createElement('span')
      n.className = s.note
      n.textContent = NOTES[i % NOTES.length]
      const angle = ((-160 + Math.random() * 120) * Math.PI) / 180
      const dist = 120 + Math.random() * 160
      n.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
      n.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
      n.style.setProperty('--r', `${Math.random() * 60 - 30}deg`)
      n.style.animationDelay = `${i * 40}ms`
      n.addEventListener('animationend', () => n.remove())
      origin.appendChild(n)
    }
  }

  return (
    <button
      ref={button}
      type="button"
      className={s.leaper}
      onClick={hop}
      onAnimationEnd={(e) => {
        if (e.animationName.includes('hop')) button.current?.classList.remove(s.hop)
      }}
      aria-label={`${alt}. Tap to make him jump.`}
    >
      <span className={s.figure}>
        <Image src={src} alt="" fill priority sizes="(max-width: 959px) 74vw, 34vw" style={{ objectFit: 'contain' }} />
      </span>
      <span ref={bell} className={s.bell} aria-hidden>
        <span className={s.ring} />
        <span className={s.ring} />
        <span className={s.ring} />
      </span>
    </button>
  )
}
