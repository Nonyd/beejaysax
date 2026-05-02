'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronDown } from 'lucide-react'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import Marquee from '@/components/ui/Marquee'
import { registerGSAP } from '@/lib/animations'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const tagRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      if (labelRef.current) {
        tl.from(labelRef.current, { y: 20, opacity: 0, duration: 0.6 }, 0.2)
      }
      ;[line1Ref, line2Ref].forEach((ref, i) => {
        if (ref.current) {
          tl.from(
            ref.current.querySelectorAll('.hero-char'),
            { y: '100%', opacity: 0, rotateX: -90, stagger: 0.03, duration: 1 },
            0.35 + i * 0.05
          )
        }
      })
      if (tagRef.current) tl.from(tagRef.current, { opacity: 0, duration: 0.6 }, 0.9)
      if (ctaRef.current) tl.from(ctaRef.current, { y: 30, opacity: 0, duration: 0.7 }, 1.1)
      if (scrollRef.current) tl.from(scrollRef.current, { opacity: 0, duration: 0.5 }, 1.5)

      if (sectionRef.current) {
        const bg = sectionRef.current.querySelector('[data-hero-bg]')
        if (bg) {
          gsap.to(bg, {
            y: '15%',
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitLine = (text: string) =>
    [...text].map((c, i) => (
      <span key={i} className="hero-char inline-block" style={{ perspective: '800px' }}>
        {c === ' ' ? '\u00a0' : c}
      </span>
    ))

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div data-hero-bg className="absolute inset-0 bg-gradient-to-br from-bjs-black via-[#0d0a04] to-bjs-black" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,8,0.2)_0%,rgba(8,8,8,0.5)_40%,rgba(8,8,8,0.85)_75%,rgba(8,8,8,1)_100%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p ref={labelRef} className="section-label mb-8">
          GOSPEL SAXOPHONIST · MUSIC MINISTER
        </p>

        <h1 className="font-serif font-bold italic leading-[0.86] tracking-[-0.02em] text-[clamp(72px,12vw,170px)]">
          <span className="block overflow-hidden text-bjs-white">
            <span ref={line1Ref} className="inline-block">
              {splitLine('BeeJay')}
            </span>
          </span>
          <span className="mt-2 block overflow-hidden text-bjs-gold">
            <span ref={line2Ref} className="inline-block">
              {splitLine('Sax.')}
            </span>
          </span>
        </h1>

        <p ref={tagRef} className="mt-8 font-serif text-xl italic text-bjs-white/60">
          Blessed & Highly Favoured.
        </p>

        <div ref={ctaRef} className="mt-12 flex flex-wrap justify-center gap-4">
          <GoldButton href="/events" size="lg">
            Upcoming Events
          </GoldButton>
          <OutlineButton href="/releases" size="lg">
            Listen Now
          </OutlineButton>
        </div>

        <div ref={scrollRef} className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="section-label">SCROLL</span>
          <ChevronDown className="h-6 w-6 animate-bounce text-bjs-gold" aria-hidden />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-bjs-border/50 bg-bjs-surface/80 py-3 backdrop-blur-sm">
        <Marquee text="BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · NIGERIA'S FINEST · SPIRIT-FILLED SOUND ·" />
      </div>
    </section>
  )
}
