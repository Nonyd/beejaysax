'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/releases', label: 'Releases' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: scrolled ? 'rgba(8,8,8,0.96)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid #1E1E1E' : 'none',
    transition: 'all 400ms ease',
  }

  return (
    <>
      <nav style={navStyle}>
        <div
          className="site-shell"
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.22em',
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
            SAX
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: pathname === l.href ? '#C9A84C' : 'rgba(245,240,232,0.55)',
                transition: 'color 200ms',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact"
          className="hidden lg:inline-flex"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#080808',
            background: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.5)',
            padding: '12px 22px',
            transition: 'all 200ms',
            alignItems: 'center',
          }}
        >
          Book BeeJay
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="lg:hidden"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            alignItems: 'flex-end',
          }}
          aria-label="Menu"
        >
          <span
            style={{
              display: 'block',
              width: 22,
              height: 1,
              background: '#F5F0E8',
              transition: 'transform 300ms',
              transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              width: 16,
              height: 1,
              background: '#F5F0E8',
              transition: 'opacity 300ms',
              opacity: open ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              width: 22,
              height: 1,
              background: '#F5F0E8',
              transition: 'transform 300ms',
              transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
            }}
          />
        </button>
        </div>
      </nav>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: '#080808',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px,7vw,48px)',
                fontStyle: 'italic',
                fontWeight: 600,
                color: pathname === l.href ? '#C9A84C' : 'rgba(245,240,232,0.35)',
                textDecoration: 'none',
                padding: '12px 0',
                animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 32,
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#080808',
              background: '#C9A84C',
              padding: '14px 36px',
              textDecoration: 'none',
            }}
          >
            Book BeeJay
          </Link>
        </div>
      )}
    </>
  )
}
