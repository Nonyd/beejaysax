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
          style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
          priority
          sizes="100vw"
        />
      </div>

      {/* Symmetric readability stack — avoids “empty right half” */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.35)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.82) 72%, #080808 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.35) 0%, transparent 35%, rgba(8,8,8,0.88) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 100,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div className="site-shell" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: 20,
            }}
          >
            Gospel Saxophonist · Music Minister
          </p>

          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(52px, 11vw, 140px)',
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              BeeJay
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(52px, 11vw, 140px)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                color: '#C9A84C',
                margin: 0,
              }}
            >
              Sax.
            </h1>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'rgba(245,240,232,0.72)',
              marginBottom: 36,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Blessed & Highly Favoured.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/events"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#080808',
                background: '#C9A84C',
                padding: '16px 36px',
                textDecoration: 'none',
                display: 'inline-block',
                minWidth: 200,
                textAlign: 'center',
              }}
            >
              Upcoming Events
            </Link>
            <Link
              href="/releases"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#F5F0E8',
                background: 'transparent',
                border: '1px solid rgba(245,240,232,0.35)',
                padding: '16px 36px',
                textDecoration: 'none',
                display: 'inline-block',
                minWidth: 200,
                textAlign: 'center',
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
            background: 'rgba(201,168,76,0.45)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.5)',
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
          height: 40,
          background: 'rgba(8,8,8,0.88)',
          borderTop: '1px solid #1E1E1E',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 60s linear infinite' }}>
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#4a4a4a',
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
