'use client'

import Image from 'next/image'
import Link from 'next/link'

const DEMO_HERO = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80'
const TICKER =
  "BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA'S FINEST · "

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '100svh',
        minHeight: 600,
        overflow: 'hidden',
        marginTop: -72,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Image
          src={DEMO_HERO}
          alt="BeeJay Sax performing"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          priority
          sizes="100vw"
        />
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.45)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 20%, rgba(8,8,8,0.7) 65%, #080808 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(8,8,8,0.55) 0%, transparent 55%)',
        }}
      />

      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0 }}>
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: 24,
            }}
          >
            Gospel Saxophonist · Music Minister
          </p>

          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(72px, 12vw, 160px)',
                fontWeight: 700,
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
                display: 'block',
              }}
            >
              BeeJay
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(72px, 12vw, 160px)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.88,
                letterSpacing: '-0.02em',
                color: '#C9A84C',
                margin: 0,
                display: 'block',
              }}
            >
              Sax.
            </h1>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontStyle: 'italic',
              color: 'rgba(245,240,232,0.5)',
              marginBottom: 40,
            }}
          >
            Blessed & Highly Favoured.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/events"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#080808',
                background: '#C9A84C',
                padding: '14px 32px',
                textDecoration: 'none',
                display: 'inline-block',
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
                color: '#F5F0E8',
                background: 'transparent',
                border: '1px solid rgba(245,240,232,0.3)',
                padding: '14px 32px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Listen Now
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background: 'rgba(201,168,76,0.4)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 9,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.4)',
          }}
        >
          Scroll
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 36,
          background: 'rgba(8,8,8,0.8)',
          borderTop: '1px solid #1E1E1E',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 60s linear infinite' }}
        >
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#333',
                paddingRight: 48,
              }}
            >
              {TICKER}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
