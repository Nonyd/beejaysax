'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid #1E1E1E' : 'none',
          transition: 'all 400ms ease',
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
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
              fontSize: 13,
              fontStyle: 'italic',
              color: '#C9A84C',
            }}
          >
            {' '}
            SAX
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: pathname === link.href ? '#C9A84C' : 'rgba(245,240,232,0.5)',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) (e.target as HTMLAnchorElement).style.color = '#F5F0E8'
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href)
                  (e.target as HTMLAnchorElement).style.color = 'rgba(245,240,232,0.5)'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact?inquiry=booking"
          className="hidden lg:block"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.5)',
            padding: '12px 22px',
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#080808'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'
          }}
        >
          Book BeeJay
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 22,
                height: 1.5,
                background: '#F5F0E8',
                transition: 'all 300ms',
                transform: menuOpen
                  ? i === 0
                    ? 'rotate(45deg) translateY(6.5px)'
                    : i === 2
                      ? 'rotate(-45deg) translateY(-6.5px)'
                      : 'scaleX(0)'
                  : 'none',
              }}
            />
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: '#080808',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 8vw, 52px)',
                fontStyle: 'italic',
                fontWeight: 600,
                color: pathname === link.href ? '#C9A84C' : 'rgba(245,240,232,0.4)',
                textDecoration: 'none',
                animation: `fadeInUp 0.4s ease ${i * 0.06}s both`,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact?inquiry=booking"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 16,
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#080808',
              background: '#C9A84C',
              padding: '14px 32px',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
