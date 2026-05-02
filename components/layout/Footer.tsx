'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#080808', borderTop: '1px solid #1E1E1E' }}>
      <div
        style={{
          padding: '80px 48px 60px',
          textAlign: 'center',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#F5F0E8',
            }}
          >
            BEEJAY
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              fontStyle: 'italic',
              color: '#C9A84C',
            }}
          >
            {' '}
            SAX
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            fontStyle: 'italic',
            color: 'rgba(201,168,76,0.5)',
            marginBottom: 40,
          }}
        >
          Blessed & Highly Favoured.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Instagram', href: 'https://instagram.com/beejaysax' },
            { label: 'YouTube', href: 'https://youtube.com/@beejaysax' },
            { label: 'Facebook', href: 'https://facebook.com/beejaysax' },
            { label: 'Spotify', href: 'https://open.spotify.com' },
            { label: 'TikTok', href: 'https://tiktok.com/@beejaysax' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#3A3A3A',
                textDecoration: 'none',
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['Home', 'Releases', 'Events', 'Gallery', 'About', 'Contact'].map((label) => (
            <Link
              key={label}
              href={label === 'Home' ? '/' : `/${label.toLowerCase()}`}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#2A2A2A',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#1E1E1E' }}>
            © {year} BeeJay Sax
          </span>
          <a
            href="https://sonshubmedia.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              color: '#2A2A2A',
              textDecoration: 'none',
            }}
          >
            Built by SonsHub Media
          </a>
        </div>
      </div>
    </footer>
  )
}
