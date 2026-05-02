'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGSAP } from '@/lib/animations'

const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift — when he plays, heaven draws near.',
    name: 'PASTOR',
    role: 'Night of Worship',
  },
  {
    quote: 'One of the most spirit-led saxophonists we’ve hosted at The Experience.',
    name: 'EVENT ORGANISER',
    role: 'The Experience',
  },
  {
    quote: 'His Online Praise Party became our family’s weekly sanctuary during lockdown.',
    name: 'AUDIENCE MEMBER',
    role: 'United Kingdom',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    gsap.registerPlugin(ScrollTrigger)
    const cards = sectionRef.current?.querySelectorAll('[data-quote-card]')
    if (!cards?.length) return
    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#0F0F0F',
        borderTop: '1px solid #1E1E1E',
        paddingTop: 140,
        paddingBottom: 140,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-16">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 16,
          }}
        >
          THEY SAY
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 600,
            lineHeight: 1.05,
            color: '#F5F0E8',
            marginBottom: 64,
          }}
        >
          The Sound Speaks
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 1, background: '#1E1E1E' }}
        >
          {QUOTES.map((item, i) => (
            <div
              key={i}
              data-quote-card
              style={{
                background: '#0F0F0F',
                padding: '48px 40px',
                position: 'relative',
                minHeight: 280,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 28,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 80,
                  color: 'rgba(201,168,76,0.06)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                aria-hidden
              >
                &ldquo;
              </span>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  color: 'rgba(245,240,232,0.8)',
                  marginBottom: 32,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>

              <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
                <div style={{ width: 24, height: 1, background: '#C9A84C', marginBottom: 12 }} />
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: 0,
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: '#4A4A4A',
                    marginTop: 4,
                  }}
                >
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
