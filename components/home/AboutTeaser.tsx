'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  registerGSAP,
  animateCounter,
  slideInFromLeft,
  slideInFromRight,
  fadeUpOnScroll,
} from '@/lib/animations'
import { HOMEPAGE_ABOUT_STATS } from '@/lib/homepage-stats'

const PORTRAIT =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'

export default function AboutTeaser() {
  const imageRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const s1 = useRef<HTMLParagraphElement>(null)
  const s2 = useRef<HTMLParagraphElement>(null)
  const s3 = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    const img = imageRef.current
    const heading = headingRef.current
    const textBlock = textRef.current
    if (img) slideInFromLeft(img)
    if (textBlock) slideInFromRight(textBlock)
    if (heading) fadeUpOnScroll(heading)
    const { albums, yearsMinistry, yearsMinistrySuffix, continents } = HOMEPAGE_ABOUT_STATS
    if (s1.current) animateCounter(s1.current, albums, 2)
    if (s2.current) animateCounter(s2.current, yearsMinistry, 2, { suffix: yearsMinistrySuffix })
    if (s3.current) animateCounter(s3.current, continents, 2)
  }, [])

  const stats = [
    { ref: s1, num: String(HOMEPAGE_ABOUT_STATS.albums), label: 'Albums' },
    { ref: s2, num: `${HOMEPAGE_ABOUT_STATS.yearsMinistry}${HOMEPAGE_ABOUT_STATS.yearsMinistrySuffix}`, label: 'Years in Ministry' },
    { ref: s3, num: String(HOMEPAGE_ABOUT_STATS.continents), label: 'Continents' },
  ] as const

  return (
    <section style={{ background: '#080808', paddingTop: 140, paddingBottom: 140 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-16">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          <div ref={imageRef} style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background: '#C9A84C',
                zIndex: 1,
              }}
            />

            <div
              style={{
                paddingLeft: 16,
                aspectRatio: '3/4',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src={PORTRAIT}
                alt="BeeJay Sax performing saxophone on stage"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div ref={textRef}>
            <p
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
              THE ARTIST
            </p>

            <h2
              ref={headingRef}
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                fontSize: 'clamp(32px, 4vw, 52px)',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: '#F5F0E8',
                marginBottom: 24,
              }}
            >
              <span style={{ display: 'block', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
                A Sound That
              </span>
              <span style={{ display: 'block', wordBreak: 'keep-all', overflowWrap: 'normal' }}>
                Moves Heaven.
              </span>
            </h2>

            <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 24 }} />

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.6)',
                marginBottom: 16,
              }}
            >
              Abolaji David Banjoko — known to the world as BeeJay Sax — is one of Nigeria&apos;s most
              distinctive gospel saxophonists. His spirit-filled tone doesn&apos;t just fill rooms; it
              moves hearts.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.6)',
                marginBottom: 40,
              }}
            >
              A Mechanical Engineering graduate who traded blueprints for ministry, BeeJay has graced
              the stages of The Experience and Night of Worship alongside Donnie McClurkin, Nathaniel
              Bassey, and Travis Greene.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                borderTop: '1px solid #1E1E1E',
                paddingTop: 32,
                marginBottom: 40,
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    paddingRight: 24,
                    borderRight: i < 2 ? '1px solid #1E1E1E' : 'none',
                    paddingLeft: i > 0 ? 24 : 0,
                  }}
                >
                  <p
                    ref={stat.ref}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(32px, 4vw, 52px)',
                      fontWeight: 700,
                      color: '#C9A84C',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    0
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#4A4A4A',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                textDecoration: 'none',
              }}
            >
              Full Story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
