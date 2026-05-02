# 🎷 BEEJAY SAX — Complete Layout Overhaul
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## CONTEXT

The site has fundamental layout problems. We are doing a ground-up rewrite 
of every public-facing component. Keep all data fetching, props, and logic 
exactly the same. Only fix the JSX/HTML structure and styling.

Build everything in one go. Do not stop between files.

---

## GLOBAL RULES FOR THIS ENTIRE CODEBASE

1. Every section: `paddingTop: 120, paddingBottom: 120` minimum
2. Every container: `maxWidth: 1200, margin: '0 auto', padding: '0 48px'`
   On mobile (`<768px`): `padding: '0 24px'`
   Use className="max-w-6xl mx-auto px-6 md:px-16"
3. NO element should overflow its parent
4. Every image must be inside `overflow: 'hidden'` container
5. NO inline-block or float layouts — use flex or grid only
6. Every heading: use `fontFamily: 'var(--font-serif)'` in inline style
7. Every body text: use `fontFamily: 'var(--font-sans)'` in inline style
8. No border-radius except circles (social icons, avatar etc)
9. Gold (#C9A84C) only on: labels, accents, active states, key headings
10. All buttons must be at minimum 44px tall for touch targets

---

## FILE 1: `components/layout/Navbar.tsx`

Rewrite completely. Keep signout logic, usePathname, scroll detection.

```tsx
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
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
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
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#F5F0E8' }}>
            BEEJAY
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: '#C9A84C' }}>
            {' '}SAX
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden lg:flex">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: pathname === link.href ? '#C9A84C' : 'rgba(245,240,232,0.5)',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => { if (pathname !== link.href) (e.target as HTMLAnchorElement).style.color = '#F5F0E8' }}
            onMouseLeave={e => { if (pathname !== link.href) (e.target as HTMLAnchorElement).style.color = 'rgba(245,240,232,0.5)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Book button */}
        <Link href="/contact" className="hidden lg:block" style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#C9A84C',
          border: '1px solid rgba(201,168,76,0.5)',
          padding: '10px 22px',
          transition: 'all 200ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C'
          ;(e.currentTarget as HTMLAnchorElement).style.color = '#080808'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'
        }}
        >
          Book BeeJay
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block',
              width: 22,
              height: 1.5,
              background: '#F5F0E8',
              transition: 'all 300ms',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translateY(6.5px)' : i === 2 ? 'rotate(-45deg) translateY(-6.5px)' : 'scaleX(0)'
                : 'none',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: '#080808',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 40,
        }}>
          {links.map((link, i) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 8vw, 52px)',
              fontStyle: 'italic',
              fontWeight: 600,
              color: pathname === link.href ? '#C9A84C' : 'rgba(245,240,232,0.4)',
              textDecoration: 'none',
              animation: `fadeInUp 0.4s ease ${i * 0.06}s both`,
            }}>
              {link.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)} style={{
            marginTop: 16,
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#080808',
            background: '#C9A84C',
            padding: '14px 32px',
            textDecoration: 'none',
          }}>
            Book BeeJay
          </Link>
        </div>
      )}
    </>
  )
}
```

---

## FILE 2: `components/home/Hero.tsx`

Rewrite completely. Keep gsap, lenis, next/image imports and data props.

```tsx
The hero must look like this:

STRUCTURE:
  <section> with height 100svh, position relative, overflow hidden

  Background:
    next/image fill objectFit cover objectPosition "center top" priority
    If no image: bg #080808
    
    THREE gradient overlays (absolutely positioned, pointer-events none):
      1. rgba(8,8,8,0.35) solid over entire image (darken)
      2. linear-gradient(to bottom, transparent 30%, rgba(8,8,8,0.8) 70%, #080808 100%)
      3. linear-gradient(to right, rgba(8,8,8,0.6) 0%, transparent 60%) — darken left side

  CONTENT (position absolute, bottom 100px, left 0, right 0):
    Container: max-w-6xl mx-auto px-6 md:px-16
    
    Section label:
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C',
                  marginBottom: 20 }}>
        GOSPEL SAXOPHONIST · MUSIC MINISTER
      </p>
    
    Heading (two separate lines, each in overflow:hidden wrapper):
      <div style={{ overflow: 'hidden', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', 
                     fontSize: 'clamp(64px, 11vw, 150px)',
                     fontWeight: 700, fontStyle: 'italic',
                     lineHeight: 0.88, letterSpacing: '-0.02em',
                     color: '#F5F0E8', whiteSpace: 'nowrap', margin: 0 }}>
          BeeJay
        </h1>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)',
                     fontSize: 'clamp(64px, 11vw, 150px)',
                     fontWeight: 700, fontStyle: 'italic',
                     lineHeight: 0.88, letterSpacing: '-0.02em',
                     color: '#C9A84C', whiteSpace: 'nowrap', margin: 0 }}>
          Sax.
        </h1>
      </div>
    
    Tagline (marginTop: 24):
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18,
                  fontStyle: 'italic', color: 'rgba(245,240,232,0.5)',
                  marginBottom: 40 }}>
        Blessed & Highly Favoured.
      </p>
    
    CTA buttons (display flex, gap 16, flexWrap wrap):
      Button 1 — [Upcoming Events] → /events:
        style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                 letterSpacing: '0.15em', textTransform: 'uppercase',
                 background: '#C9A84C', color: '#080808',
                 padding: '14px 32px', textDecoration: 'none',
                 display: 'inline-block', border: 'none', cursor: 'pointer' }}
      
      Button 2 — [Listen Now] → /releases:
        style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                 letterSpacing: '0.15em', textTransform: 'uppercase',
                 background: 'transparent', color: '#F5F0E8',
                 padding: '14px 32px', textDecoration: 'none',
                 display: 'inline-block',
                 border: '1px solid rgba(245,240,232,0.3)', cursor: 'pointer' }}

  SCROLL INDICATOR (position absolute, bottom 32px, left 50%, transform translateX(-50%)):
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)' }}>SCROLL</p>
      <div style={{ width: 1, height: 40, background: 'rgba(201,168,76,0.4)',
                    animation: 'pulse 2s ease-in-out infinite' }} />
    </div>

  BOTTOM TICKER (position absolute, bottom 0, left 0, right 0):
    height: 36px
    background: rgba(8,8,8,0.7)
    backdropFilter: blur(10px)
    borderTop: 1px solid #1E1E1E
    overflow: hidden
    display: flex
    alignItems: center
    
    Inner: flex with animation marquee 60s linear infinite
    Content (repeated 3x): 
      "BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · 
       BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA'S FINEST · "
    Font: DM Sans 9px tracking-[0.25em] uppercase color #3A3A3A
    Separator: gold ◆ with marginLeft/Right 20px color #C9A84C opacity 0.4
```

---

## FILE 3: `components/home/AboutTeaser.tsx`

```tsx
Structure:
  <section style={{ background: '#080808', paddingTop: 140, paddingBottom: 140 }}>
    <div className="max-w-6xl mx-auto px-6 md:px-16">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
           className="grid-cols-1 md:grid-cols-2">
        
        {/* LEFT — Image */}
        <div style={{ position: 'relative' }}>
          {/* Gold left accent line */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#C9A84C', zIndex: 1 }} />
          
          {/* Image container */}
          <div style={{ paddingLeft: 16, aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
            <Image src={portraitImage} alt="BeeJay Sax" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        
        {/* RIGHT — Text */}
        <div>
          {/* Section label */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
                      letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C',
                      marginBottom: 20 }}>
            THE ARTIST
          </p>
          
          {/* Heading — NEVER breaks mid-word */}
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600,
                       fontSize: 'clamp(32px, 4vw, 52px)',
                       lineHeight: 1.05, letterSpacing: '-0.01em', color: '#F5F0E8',
                       marginBottom: 24 }}>
            <span style={{ display: 'block' }}>A Sound That</span>
            <span style={{ display: 'block' }}>Moves Heaven.</span>
          </h2>
          
          {/* Gold rule */}
          <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 24 }} />
          
          {/* Body text */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8,
                      color: 'rgba(245,240,232,0.6)', marginBottom: 16 }}>
            Abolaji David Banjoko — known to the world as BeeJay Sax — is one of 
            Nigeria's most distinctive gospel saxophonists. His spirit-filled tone 
            doesn't just fill rooms; it moves hearts.
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8,
                      color: 'rgba(245,240,232,0.6)', marginBottom: 40 }}>
            A Mechanical Engineering graduate who traded blueprints for ministry, 
            BeeJay has graced the stages of The Experience and Night of Worship 
            alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
          </p>
          
          {/* Stats — 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        borderTop: '1px solid #1E1E1E', paddingTop: 32, marginBottom: 40 }}>
            {[
              { num: '2', label: 'Albums' },
              { num: '20+', label: 'Years in Ministry' },
              { num: '3', label: 'Continents' },
            ].map((stat, i) => (
              <div key={i} style={{ paddingRight: 24, borderRight: i < 2 ? '1px solid #1E1E1E' : 'none',
                                    paddingLeft: i > 0 ? 24 : 0 }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 4vw, 52px)',
                             fontWeight: 700, color: '#C9A84C', lineHeight: 1, marginBottom: 6 }}>
                  {stat.num}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.15em',
                             textTransform: 'uppercase', color: '#4A4A4A' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          
          {/* CTA link */}
          <Link href="/about" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        color: '#C9A84C', textDecoration: 'none' }}>
            Full Story →
          </Link>
        </div>
      </div>
    </div>
  </section>
```

---

## FILE 4: `components/home/FeaturedRelease.tsx`

```tsx
Structure:
  <section style={{ background: '#0F0F0F', borderTop: '1px solid #1E1E1E',
                    borderBottom: '1px solid #1E1E1E', paddingTop: 140, paddingBottom: 140 }}>
    <div className="max-w-6xl mx-auto px-6 md:px-16">
      
      {/* Section label */}
      <p style={{ fontFamily:'var(--font-sans)', fontSize:10, fontWeight:500,
                  letterSpacing:'0.3em', textTransform:'uppercase', color:'#C9A84C',
                  marginBottom: 56 }}>
        LATEST RELEASE
      </p>
      
      {/* Grid: image left, details right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 80, alignItems: 'center' }}
           className="grid-cols-1 md:grid-cols-[2fr_3fr]">
        
        {/* Cover image */}
        <div style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {release.coverImage ? (
            <Image src={release.coverImage} alt={release.title} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', 
                          background: 'linear-gradient(135deg, #1a1204 0%, #2d1f06 50%, #0d0a02 100%)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.3em',
                           textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)', marginBottom: 12 }}>
                ALBUM
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3vw, 28px)',
                           fontStyle: 'italic', color: '#C9A84C', textAlign: 'center', padding: '0 24px' }}>
                {release.title}
              </p>
            </div>
          )}
        </div>
        
        {/* Details */}
        <div>
          {/* Type badge */}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600,
                          letterSpacing: '0.2em', textTransform: 'uppercase',
                          color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
                          padding: '5px 12px', display: 'inline-block', marginBottom: 20 }}>
            {release.releaseType}
          </span>
          
          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 52px)',
                        fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.01em',
                        color: '#F5F0E8', marginBottom: 20 }}>
            {release.title}
          </h2>
          
          {/* Gold rule */}
          <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 20 }} />
          
          {/* Description */}
          {release.description && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8,
                         color: 'rgba(245,240,232,0.6)', marginBottom: 32,
                         display: '-webkit-box', WebkitLineClamp: 3,
                         WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {release.description}
            </p>
          )}
          
          {/* Stream label */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 500,
                       letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C',
                       marginBottom: 16 }}>
            STREAM NOW
          </p>
          
          {/* Streaming links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
            {[
              { label: 'Spotify', url: release.spotifyUrl },
              { label: 'Apple Music', url: release.appleMusicUrl },
              { label: 'Audiomack', url: release.audiomackUrl },
              { label: 'YouTube', url: release.youtubeUrl },
              { label: 'Boomplay', url: release.boomplayUrl },
            ].filter(p => p.url).map(platform => (
              <a key={platform.label} href={platform.url!} target="_blank" rel="noopener noreferrer"
                 style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
                           letterSpacing: '0.1em', textTransform: 'uppercase',
                           color: '#F5F0E8', textDecoration: 'none',
                           border: '1px solid #2A2A2A', padding: '10px 18px',
                           transition: 'all 200ms' }}
                 onMouseEnter={e => {
                   (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C9A84C'
                   ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'
                 }}
                 onMouseLeave={e => {
                   (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2A2A2A'
                   ;(e.currentTarget as HTMLAnchorElement).style.color = '#F5F0E8'
                 }}>
                {platform.label}
              </a>
            ))}
          </div>
          
          <Link href={`/releases/${release.slug}`}
                style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          color: '#C9A84C', textDecoration: 'none' }}>
            More About This Release →
          </Link>
        </div>
      </div>
    </div>
  </section>
```

---

## FILE 5: `components/events/EventCard.tsx`

```tsx
<div style={{
  background: '#0F0F0F',
  border: '1px solid #1E1E1E',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 350ms ease',
  display: 'flex',
  flexDirection: 'column',
}}
onMouseEnter={e => {
  (e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C'
  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
}}
onMouseLeave={e => {
  (e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E1E'
  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
}}
onClick={() => router.push(`/events/${event.id}`)}
>
  {/* Image area */}
  <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
    {event.posterImage ? (
      <Image src={event.posterImage} alt={event.title} fill style={{ objectFit: 'cover' }} />
    ) : (
      <div style={{ width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #0d0a02 0%, #1a1204 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, opacity: 0.15 }}>🎷</span>
      </div>
    )}
    
    {/* Status badge */}
    <span style={{
      position: 'absolute', top: 12, right: 12,
      fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600,
      letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '4px 10px',
      background: event.status === 'UPCOMING' ? '#C9A84C' : '#1E1E1E',
      color: event.status === 'UPCOMING' ? '#080808' : '#4A4A4A',
    }}>
      {event.status}
    </span>
    
    {/* Date badge */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(10px)',
      padding: '12px 16px',
      borderTop: '1px solid #2A2A2A', borderRight: '1px solid #2A2A2A',
    }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700,
                   color: '#C9A84C', lineHeight: 1, margin: 0 }}>
        {new Date(event.eventDate).getDate()}
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.15em',
                   textTransform: 'uppercase', color: '#4A4A4A', marginTop: 2 }}>
        {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })} {new Date(event.eventDate).getFullYear()}
      </p>
    </div>
  </div>
  
  {/* Body */}
  <div style={{ padding: '20px 20px 0' }}>
    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600,
                  color: '#F5F0E8', lineHeight: 1.3, margin: '0 0 8px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden' }}>
      {event.title}
    </h3>
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#4A4A4A', margin: 0 }}>
      {event.venue} · {event.city}
    </p>
    {event.eventTime && (
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#2A2A2A', marginTop: 4 }}>
        {event.eventTime}
      </p>
    )}
  </div>
  
  {/* Footer */}
  <div style={{ padding: '16px 20px 20px',
                borderTop: '1px solid #141414', marginTop: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#C9A84C' }}>
      {event.isFree ? 'FREE' : `₦${event.ticketPrice?.toLocaleString()}`}
    </span>
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
      padding: '8px 16px', cursor: 'pointer',
      transition: 'all 200ms',
    }}>
      {event.isFree ? 'Register' : 'Get Tickets'}
    </span>
  </div>
</div>
```

---

## FILE 6: `components/home/TestimonialsSection.tsx`

```tsx
<section style={{ background: '#0F0F0F', borderTop: '1px solid #1E1E1E',
                  paddingTop: 140, paddingBottom: 140 }}>
  <div className="max-w-6xl mx-auto px-6 md:px-16">
    
    <p style={{ fontFamily:'var(--font-sans)', fontSize:10, fontWeight:500,
                letterSpacing:'0.3em', textTransform:'uppercase', color:'#C9A84C',
                marginBottom: 16 }}>
      THEY SAY
    </p>
    <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,4vw,52px)',
                  fontWeight:600, lineHeight:1.05, color:'#F5F0E8', marginBottom: 64 }}>
      The Sound Speaks
    </h2>
    
    {/* Cards grid — 3 cols on desktop, 1 on mobile */}
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1, background: '#1E1E1E' }}>
      {[
        {
          quote: "BeeJay Sax carries a rare gift — when he plays, heaven draws near.",
          name: "PASTOR",
          role: "Night of Worship"
        },
        {
          quote: "One of the most spirit-led saxophonists we've hosted at The Experience.",
          name: "EVENT ORGANISER",
          role: "The Experience"
        },
        {
          quote: "His Online Praise Party became our family's weekly sanctuary during lockdown.",
          name: "AUDIENCE MEMBER",
          role: "United Kingdom"
        },
      ].map((item, i) => (
        <div key={i} style={{ background: '#0F0F0F', padding: '48px 36px', position: 'relative' }}>
          {/* Big quote mark */}
          <span style={{
            position: 'absolute', top: 24, right: 28,
            fontFamily: 'var(--font-serif)', fontSize: 80,
            color: 'rgba(201,168,76,0.06)', lineHeight: 1,
            pointerEvents: 'none', userSelect: 'none',
          }}>"</span>
          
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic',
                       lineHeight: 1.7, color: 'rgba(245,240,232,0.8)', marginBottom: 32,
                       position: 'relative', zIndex: 1 }}>
            &ldquo;{item.quote}&rdquo;
          </p>
          
          <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
            <div style={{ width: 24, height: 1, background: '#C9A84C', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
                         letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C',
                         margin: 0 }}>
              {item.name}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#4A4A4A', marginTop: 4 }}>
              {item.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## FILE 7: `components/home/ContactCTA.tsx`

```tsx
<section style={{ background: '#080808', borderTop: '1px solid #1E1E1E',
                  paddingTop: 140, paddingBottom: 140 }}>
  <div className="max-w-6xl mx-auto px-6 md:px-16" style={{ textAlign: 'center' }}>
    
    <p style={{ fontFamily:'var(--font-sans)', fontSize:10, fontWeight:500,
                letterSpacing:'0.3em', textTransform:'uppercase', color:'#C9A84C',
                marginBottom: 20 }}>
      GET IN TOUCH
    </p>
    
    <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: 'clamp(40px, 7vw, 96px)',
                  lineHeight: 0.92, letterSpacing: '-0.02em',
                  color: '#F5F0E8', whiteSpace: 'nowrap', display: 'block', margin: 0 }}>
      Let&apos;s Create
    </h2>
    <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontStyle: 'italic',
                  fontSize: 'clamp(40px, 7vw, 96px)',
                  lineHeight: 0.92, letterSpacing: '-0.02em',
                  color: '#C9A84C', whiteSpace: 'nowrap', display: 'block',
                  margin: '0 0 32px' }}>
      Something Sacred.
    </h2>
    
    <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '0 auto 32px' }} />
    
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8,
                 color: 'rgba(245,240,232,0.5)', maxWidth: 480, margin: '0 auto 48px' }}>
      Available for concerts, corporate events, gospel conferences,
      and collaborations — within Nigeria and internationally.
    </p>
    
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
      <Link href="/contact?inquiry=booking" style={{
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        background: '#C9A84C', color: '#080808', padding: '14px 36px',
        textDecoration: 'none', display: 'inline-block',
      }}>
        Book BeeJay
      </Link>
      <Link href="/contact" style={{
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        background: 'transparent', color: '#F5F0E8',
        border: '1px solid rgba(245,240,232,0.25)',
        padding: '14px 36px', textDecoration: 'none', display: 'inline-block',
      }}>
        Send a Message
      </Link>
    </div>
    
    <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { icon: '📍', text: 'Lagos, Nigeria' },
        { icon: '📞', text: '+234 80 5898 2828' },
        { icon: '✉️', text: 'booking@beejaysax.com' },
      ].map(item => (
        <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>{item.icon}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#4A4A4A' }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## FILE 8: `components/layout/Footer.tsx`

```tsx
<footer style={{ background: '#080808', borderTop: '1px solid #1E1E1E' }}>
  
  {/* Top section */}
  <div style={{ padding: '80px 48px 60px', textAlign: 'center',
                borderBottom: '1px solid #1E1E1E' }}>
    
    {/* Large wordmark */}
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
                      letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F0E8' }}>
        BEEJAY
      </span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic', color: '#C9A84C' }}>
        {' '}SAX
      </span>
    </div>
    
    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontStyle: 'italic',
                 color: 'rgba(201,168,76,0.5)', marginBottom: 40 }}>
      Blessed & Highly Favoured.
    </p>
    
    {/* Social icons */}
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[
        { label: 'Instagram', href: 'https://instagram.com/beejaysax' },
        { label: 'YouTube', href: 'https://youtube.com' },
        { label: 'Facebook', href: 'https://facebook.com' },
        { label: 'Spotify', href: 'https://spotify.com' },
      ].map(social => (
        <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
           style={{
             width: 40, height: 40, borderRadius: '50%',
             border: '1px solid #1E1E1E',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontFamily: 'var(--font-sans)', fontSize: 9,
             letterSpacing: '0.08em', textTransform: 'uppercase',
             color: '#4A4A4A', textDecoration: 'none',
             transition: 'all 200ms',
           }}
           onMouseEnter={e => {
             (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C9A84C'
             ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'
           }}
           onMouseLeave={e => {
             (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1E1E1E'
             ;(e.currentTarget as HTMLAnchorElement).style.color = '#4A4A4A'
           }}>
          {social.label.slice(0, 2).toUpperCase()}
        </a>
      ))}
    </div>
  </div>
  
  {/* Bottom section */}
  <div style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
    
    {/* Nav links */}
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {['Home', 'Releases', 'Events', 'Gallery', 'About', 'Contact'].map(label => (
        <Link key={label} href={label === 'Home' ? '/' : `/${label.toLowerCase()}`}
              style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.15em',
                        textTransform: 'uppercase', color: '#2A2A2A', textDecoration: 'none' }}>
          {label}
        </Link>
      ))}
    </div>
    
    {/* Copyright */}
    <div style={{ display: 'flex', gap: 24 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#1E1E1E' }}>
        © 2025 BeeJay Sax
      </span>
      <a href="https://sonshubmedia.com" target="_blank" rel="noopener noreferrer"
         style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#2A2A2A',
                   textDecoration: 'none' }}>
        Built by SonsHub Media
      </a>
    </div>
  </div>
</footer>
```

---

## AFTER ALL FILES ARE DONE

1. Run: `npm run build`
2. Fix any TypeScript errors (types only, no logic changes)
3. Run: `git add . && git commit -m "Complete layout overhaul" && git push`
4. Send a report:
   - Files changed
   - Build status: pass/fail
   - Any remaining issues

---

*BeeJay Sax — Layout Overhaul*
*SonsHub Media Ltd.*
