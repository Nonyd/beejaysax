'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GoldButton from '@/components/ui/GoldButton'
import OutlineButton from '@/components/ui/OutlineButton'
import Marquee from '@/components/ui/Marquee'
import { registerGSAP } from '@/lib/animations'
import { heroDisplayLineStyle, sectionLabelStyle } from '@/lib/typography-styles'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const tagRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const linePulseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      if (labelRef.current) {
        tl.from(labelRef.current, { y: 20, opacity: 0, duration: 0.6 }, 0.1)
      }
      ;[line1Ref, line2Ref].forEach((ref, i) => {
        if (ref.current) {
          tl.from(
            ref.current.querySelectorAll('.hero-char'),
            { y: '100%', opacity: 0, stagger: 0.03, duration: 1 },
            0.35 + i * 0.05
          )
        }
      })
      if (tagRef.current) tl.from(tagRef.current, { opacity: 0, duration: 0.6 }, 0.8)
      if (ctaRef.current) tl.from(ctaRef.current.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.55 }, 1.0)
      if (scrollRef.current) tl.from(scrollRef.current, { opacity: 0, duration: 0.5 }, 1.4)

      if (linePulseRef.current) {
        gsap.to(linePulseRef.current, {
          scaleX: 1.15,
          opacity: 0.7,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      if (sectionRef.current) {
        const bg = sectionRef.current.querySelector('[data-hero-bg]')
        if (bg) {
          gsap.to(bg, {
            y: '8%',
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
      <span key={i} className="hero-char inline-block">
        {c === ' ' ? '\u00a0' : c}
      </span>
    ))

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div data-hero-bg className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="BeeJay Sax — performance"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: [
            'linear-gradient(to right, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 100%)',
            'linear-gradient(to bottom, transparent 40%, rgba(8,8,8,0.9) 80%, #080808 100%)',
            'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-20 md:px-12 md:pb-20">
        <div className="w-full max-w-[900px]">
          <p ref={labelRef} style={{ ...sectionLabelStyle, marginBottom: 24 }}>
            GOSPEL SAXOPHONIST · MUSIC MINISTER
          </p>

          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                ...heroDisplayLineStyle,
                color: '#F5F0E8',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              <span ref={line1Ref} className="inline-block">
                {splitLine('BeeJay')}
              </span>
            </h1>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                ...heroDisplayLineStyle,
                color: '#C9A84C',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              <span ref={line2Ref} className="inline-block">
                {splitLine('Sax.')}
              </span>
            </h1>
          </div>

          <p ref={tagRef} className="mt-6 font-serif text-lg italic text-[rgba(245,240,232,0.5)] md:text-xl">
            Blessed & Highly Favoured.
          </p>

          <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4">
            <GoldButton href="/events" size="lg">
              Upcoming Events
            </GoldButton>
            <OutlineButton href="/releases" size="lg">
              Listen Now
            </OutlineButton>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-28 left-6 z-10 flex items-center gap-3 md:left-12 lg:bottom-32"
      >
        <span style={sectionLabelStyle}>SCROLL</span>
        <div ref={linePulseRef} className="h-px w-10 origin-left bg-bjs-gold" aria-hidden />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-9 border-t border-bjs-border bg-[rgba(8,8,8,0.6)] backdrop-blur-[10px]">
        <div className="flex h-full items-center">
          <Marquee text="BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA'S FINEST ·" />
        </div>
      </div>
    </section>
  )
}
