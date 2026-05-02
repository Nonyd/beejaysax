'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Marquee from '@/components/ui/Marquee'
import { registerGSAP } from '@/lib/animations'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const line1Ref = useRef<HTMLHeadingElement>(null)
  const line2Ref = useRef<HTMLHeadingElement>(null)
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
        tl.from(labelRef.current, { y: 20, opacity: 0, duration: 0.6 }, 0.1)
      }
      if (line1Ref.current) {
        tl.from(line1Ref.current, { y: '100%', opacity: 0, duration: 1 }, 0.35)
      }
      if (line2Ref.current) {
        tl.from(line2Ref.current, { y: '100%', opacity: 0, duration: 1 }, 0.4)
      }
      if (tagRef.current) tl.from(tagRef.current, { opacity: 0, duration: 0.6 }, 0.8)
      if (ctaRef.current)
        tl.from(ctaRef.current.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.55 }, 1.0)
      if (scrollRef.current) tl.from(scrollRef.current, { opacity: 0, duration: 0.5 }, 1.4)

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

  return (
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden">
      <div data-hero-bg className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="BeeJay Sax — performance"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center top' }}
          sizes="100vw"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: 'rgba(8,8,8,0.35)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 30%, rgba(8,8,8,0.8) 70%, #080808 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(to right, rgba(8,8,8,0.6) 0%, transparent 60%)',
        }}
      />

      <div
        className="absolute bottom-[100px] left-0 right-0 z-10"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-16">
          <p
            ref={labelRef}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: 20,
            }}
          >
            GOSPEL SAXOPHONIST · MUSIC MINISTER
          </p>

          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <h1
              ref={line1Ref}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(64px, 11vw, 150px)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              BeeJay
            </h1>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h1
              ref={line2Ref}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(64px, 11vw, 150px)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
                color: '#C9A84C',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              Sax.
            </h1>
          </div>

          <p
            ref={tagRef}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'rgba(245,240,232,0.5)',
              marginTop: 24,
              marginBottom: 40,
            }}
          >
            Blessed & Highly Favoured.
          </p>

          <div ref={ctaRef} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/events"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: '#C9A84C',
                color: '#080808',
                padding: '14px 32px',
                minHeight: 44,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Upcoming Events
            </Link>
            <Link
              href="/releases"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: '#F5F0E8',
                padding: '14px 32px',
                minHeight: 44,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245,240,232,0.3)',
                cursor: 'pointer',
              }}
            >
              Listen Now
            </Link>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.6)',
          }}
        >
          SCROLL
        </p>
        <div
          style={{
            width: 1,
            height: 40,
            background: 'rgba(201,168,76,0.4)',
            transformOrigin: 'center bottom',
            animation: 'hero-scroll-pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden"
        style={{
          height: 36,
          background: 'rgba(8,8,8,0.7)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Marquee
          speed="slow"
          text="BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA'S FINEST · "
        />
      </div>
    </section>
  )
}
