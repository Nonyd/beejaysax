'use client'

import Link from 'next/link'

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/beejaysax' },
  { label: 'YouTube', href: 'https://youtube.com/@beejaysax' },
  { label: 'Facebook', href: 'https://facebook.com/beejaysax' },
  { label: 'Spotify', href: 'https://open.spotify.com' },
  { label: 'TikTok', href: 'https://tiktok.com/@beejaysax' },
]

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Releases', href: '/releases' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#080808', borderTop: '1px solid #1E1E1E' }}>
      <div
        className="site-shell"
        style={{ paddingTop: 80, paddingBottom: 64, textAlign: 'center' }}
      >
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#F5F0E8',
            }}
          >
            BEEJAY{' '}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontStyle: 'italic',
              color: '#C9A84C',
            }}
          >
            SAX
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'rgba(201,168,76,0.5)',
            marginBottom: 40,
          }}
        >
          Blessed & Highly Favoured.
        </p>

        <div style={{ display: 'flex', gap: '16px 28px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.45)',
                textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C9A84C'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(245,240,232,0.45)'
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="site-shell">
      {/* Divider lives inside the shell so it matches the content width, not the padded box */}
      <div
        className="flex flex-col items-center justify-between gap-4 md:flex-row"
        style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24, paddingBottom: 24 }}
      >
        <div className="flex flex-wrap justify-center" style={{ gap: '12px 20px' }}>
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.4)',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>
            © {new Date().getFullYear()} BeeJay Sax
          </span>
          <a
            href="https://sonshubmedia.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(245,240,232,0.3)', textDecoration: 'none' }}
          >
            Built by SonsHub Media
          </a>
        </div>
      </div>
      </div>
    </footer>
  )
}
