# 🎷 BEEJAY SAX — Total Ground-Up Redesign
## Single Cursor Prompt — Builds Everything At Once

---

## WHAT YOU ARE DOING

Completely rewrite every public-facing page and component from scratch.
The current code has accumulated too many conflicting styles.
Start fresh on all visual files. Keep all data, APIs, auth, and logic untouched.

**DO NOT TOUCH:**
- `/app/api/` — any file
- `/lib/` — any file
- `/prisma/` — any file
- `/app/admin/` — any file
- `/components/admin/` — any file
- `middleware.ts`
- `next.config.ts`
- `tailwind.config.ts`

**REWRITE COMPLETELY:**
- `app/globals.css`
- `app/(site)/layout.tsx`
- `app/(site)/page.tsx`
- `app/(site)/about/page.tsx`
- `app/(site)/events/page.tsx`
- `app/(site)/events/[id]/page.tsx`
- `app/(site)/releases/page.tsx`
- `app/(site)/releases/[slug]/page.tsx`
- `app/(site)/gallery/page.tsx`
- `app/(site)/contact/page.tsx` and `ContactForm.tsx`
- `app/not-found.tsx`
- `app/error.tsx`
- ALL files in `components/home/`
- ALL files in `components/layout/`
- ALL files in `components/events/`
- ALL files in `components/releases/`
- ALL files in `components/gallery/`
- ALL files in `components/ui/`

---

## ABSOLUTE RULES — FOLLOW THESE OR THE DESIGN BREAKS

### Rule 1 — Navbar height
The navbar is fixed at the top. Height = 72px.
Every page must start content below the navbar.
In `app/(site)/layout.tsx`, the `<main>` element MUST have:
```tsx
<main style={{ paddingTop: 72 }}>
  {children}
</main>
```
This is non-negotiable. Every page inherits this automatically.

### Rule 2 — No Tailwind for typography
Do NOT use Tailwind classes for font-size, font-family, line-height, letter-spacing.
Use ONLY inline styles for all typography.
Example of WRONG: `className="text-4xl font-serif italic"`
Example of RIGHT: `style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontStyle: 'italic' }}`

### Rule 3 — Container width
Every section content must be inside:
```tsx
<div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
```
On mobile, padding becomes 24px. Use:
```tsx
className="max-w-[1200px] mx-auto px-6 md:px-12"
```

### Rule 4 — Section spacing
Every `<section>` must have:
```tsx
style={{ paddingTop: 120, paddingBottom: 120 }}
```

### Rule 5 — Images
Every `next/image` must be inside a container with `overflow: 'hidden'`.
Every `next/image` with `fill` prop must have parent with `position: 'relative'`.

### Rule 6 — No word breaks
Every heading must have its lines explicitly set.
Never let a heading wrap automatically.
Use:
```tsx
<h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 8vw, 110px)',
             fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.02em',
             color: '#F5F0E8', margin: 0 }}>
  <span style={{ display: 'block' }}>Line One</span>
  <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Line Two.</span>
</h1>
```

### Rule 7 — Colors
```
Background:  #080808
Surface:     #0F0F0F
Border:      #1E1E1E
White:       #F5F0E8
Gold:        #C9A84C
Gold hover:  #E8C96D
Muted text:  #555555
```

### Rule 8 — Fonts
```
Serif:  var(--font-serif)   → Playfair Display
Sans:   var(--font-sans)    → DM Sans
```

---

## STEP 1 — `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: #080808;
  color: #F5F0E8;
  scroll-behavior: auto;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-sans, 'DM Sans', sans-serif);
  background: #080808;
  overflow-x: hidden;
}

::selection { background: #C9A84C; color: #080808; }
::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-thumb { background: #C9A84C; }
:focus-visible { outline: 1px solid #C9A84C; outline-offset: 3px; }

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@media print {
  nav, footer, .no-print { display: none !important; }
}
```

---

## STEP 2 — `app/(site)/layout.tsx`

```tsx
import { playfair, dmSans } from '@/lib/fonts'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LenisProvider from '@/components/providers/LenisProvider'
import BackToTop from '@/components/ui/BackToTop'
import '../../globals.css'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body style={{ background: '#080808', color: '#F5F0E8' }}>
        <LenisProvider>
          <Navbar />
          <main style={{ paddingTop: 72, minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
          <BackToTop />
        </LenisProvider>
      </body>
    </html>
  )
}
```

---

## STEP 3 — `components/layout/Navbar.tsx`

```tsx
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
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 72,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 48px',
    background: scrolled ? 'rgba(8,8,8,0.96)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid #1E1E1E' : 'none',
    transition: 'all 400ms ease',
  }

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#F5F0E8' }}>BEEJAY</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, fontStyle: 'italic', color: '#C9A84C' }}>SAX</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden lg:flex">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10, fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
              color: pathname === l.href ? '#C9A84C' : 'rgba(245,240,232,0.45)',
              transition: 'color 200ms',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Book button */}
        <Link href="/contact" className="hidden lg:flex" style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#C9A84C',
          border: '1px solid rgba(201,168,76,0.4)',
          padding: '10px 24px',
          transition: 'all 200ms',
          alignItems: 'center',
        }}>
          Book BeeJay
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}
          aria-label="Menu"
        >
          <span style={{ display: 'block', width: open ? 22 : 22, height: 1, background: '#F5F0E8', transition: 'transform 300ms', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', width: 16, height: 1, background: '#F5F0E8', transition: 'opacity 300ms', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: open ? 22 : 22, height: 1, background: '#F5F0E8', transition: 'transform 300ms', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {NAV_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,7vw,48px)', fontStyle: 'italic', fontWeight: 600,
              color: pathname === l.href ? '#C9A84C' : 'rgba(245,240,232,0.35)',
              textDecoration: 'none', padding: '12px 0',
              animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} style={{
            marginTop: 32, fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#080808', background: '#C9A84C', padding: '14px 36px', textDecoration: 'none',
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

## STEP 4 — `components/layout/Footer.tsx`

```tsx
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
      
      {/* Main footer */}
      <div style={{ padding: '80px 48px 64px', textAlign: 'center', borderBottom: '1px solid #1E1E1E' }}>
        
        {/* Wordmark */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F0E8' }}>BEEJAY </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, fontStyle: 'italic', color: '#C9A84C' }}>SAX</span>
        </div>
        
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontStyle: 'italic', color: 'rgba(201,168,76,0.5)', marginBottom: 40 }}>
          Blessed & Highly Favoured.
        </p>
        
        {/* Social links */}
        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333', textDecoration: 'none', transition: 'color 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
      
      {/* Bottom bar */}
      <div style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {NAV.map(l => (
            <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#222', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#1E1E1E' }}>© {new Date().getFullYear()} BeeJay Sax</span>
          <a href="https://sonshubmedia.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: '#222', textDecoration: 'none' }}>
            Built by SonsHub Media
          </a>
        </div>
      </div>
    </footer>
  )
}
```

---

## STEP 5 — `components/home/Hero.tsx`

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'

const DEMO_HERO = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80'
const TICKER = 'BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA\'S FINEST · '

export default function Hero() {
  return (
    <section style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', marginTop: -72 }}>
      
      {/* Background image */}
      <Image src={DEMO_HERO} alt="BeeJay Sax performing" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} priority />
      
      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(8,8,8,0.7) 65%, #080808 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,0.55) 0%, transparent 55%)' }} />
      
      {/* Content */}
      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0 }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          
          {/* Label */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 24 }}>
            Gospel Saxophonist · Music Minister
          </p>
          
          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(72px, 12vw, 160px)', fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.02em', color: '#F5F0E8', margin: 0, display: 'block' }}>
              BeeJay
            </h1>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(72px, 12vw, 160px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 0.88, letterSpacing: '-0.02em', color: '#C9A84C', margin: 0, display: 'block' }}>
              Sax.
            </h1>
          </div>
          
          {/* Tagline */}
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', color: 'rgba(245,240,232,0.5)', marginBottom: 40 }}>
            Blessed & Highly Favoured.
          </p>
          
          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/events" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#080808', background: '#C9A84C', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Upcoming Events
            </Link>
            <Link href="/releases" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5F0E8', background: 'transparent', border: '1px solid rgba(245,240,232,0.3)', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Listen Now
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 1, height: 48, background: 'rgba(201,168,76,0.4)', animation: 'pulse 2s ease-in-out infinite' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)' }}>Scroll</p>
      </div>
      
      {/* Ticker */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'rgba(8,8,8,0.8)', borderTop: '1px solid #1E1E1E', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 60s linear infinite' }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#333', paddingRight: 48 }}>
              {TICKER}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 6 — `components/home/AboutTeaser.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'

const DEMO_PORTRAIT = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'

export default function AboutTeaser() {
  return (
    <section style={{ background: '#080808', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          
          {/* Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#C9A84C', zIndex: 1 }} />
            <div style={{ marginLeft: 20, position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
              <Image src={DEMO_PORTRAIT} alt="BeeJay Sax portrait" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
          
          {/* Text */}
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 20 }}>
              The Artist
            </p>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, lineHeight: 1.05, color: '#F5F0E8', margin: '0 0 24px' }}>
              <span style={{ display: 'block' }}>A Sound That</span>
              <span style={{ display: 'block' }}>Moves Heaven.</span>
            </h2>
            
            <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 24 }} />
            
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8, color: 'rgba(245,240,232,0.6)', marginBottom: 16 }}>
              Abolaji David Banjoko — known as BeeJay Sax — is one of Nigeria's most distinctive gospel saxophonists. His spirit-filled tone doesn't just fill rooms; it moves hearts.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8, color: 'rgba(245,240,232,0.6)', marginBottom: 40 }}>
              A Mechanical Engineering graduate who traded blueprints for full-time ministry, BeeJay has graced stages alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
            </p>
            
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #1E1E1E', paddingTop: 32, marginBottom: 40 }}>
              {[
                { num: '2', label: 'Albums' },
                { num: '20+', label: 'Years Ministry' },
                { num: '3', label: 'Continents' },
              ].map((s, i) => (
                <div key={i} style={{ paddingLeft: i > 0 ? 24 : 0, paddingRight: i < 2 ? 24 : 0, borderRight: i < 2 ? '1px solid #1E1E1E' : 'none' }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px,4vw,52px)', fontWeight: 700, color: '#C9A84C', lineHeight: 1, margin: '0 0 6px' }}>{s.num}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
            
            <Link href="/about" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none' }}>
              Full Story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 7 — `components/home/FeaturedRelease.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function FeaturedRelease() {
  const release = await prisma.release.findFirst({ where: { isFeatured: true } })
  if (!release) return null

  const platforms = [
    { label: 'Spotify', url: release.spotifyUrl },
    { label: 'Apple Music', url: release.appleMusicUrl },
    { label: 'Audiomack', url: release.audiomackUrl },
    { label: 'YouTube', url: release.youtubeUrl },
    { label: 'Boomplay', url: release.boomplayUrl },
  ].filter(p => p.url)

  return (
    <section style={{ background: '#0F0F0F', borderTop: '1px solid #1E1E1E', borderBottom: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 56 }}>
          Latest Release
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]" style={{ gap: 80, alignItems: 'center' }}>
          
          {/* Cover */}
          <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', width: '100%' }}>
            {release.coverImage ? (
              <Image src={release.coverImage} alt={release.title} fill style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1204, #0d0a02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)', marginBottom: 16 }}>{release.releaseType}</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px,2vw,28px)', fontStyle: 'italic', color: '#C9A84C', textAlign: 'center' }}>{release.title}</p>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '5px 12px', display: 'inline-block', marginBottom: 20 }}>
              {release.releaseType}
            </span>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, lineHeight: 1.05, color: '#F5F0E8', margin: '0 0 20px' }}>
              {release.title}
            </h2>
            
            <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 20 }} />
            
            {release.description && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8, color: 'rgba(245,240,232,0.6)', marginBottom: 32 }}>
                {release.description}
              </p>
            )}
            
            {platforms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>Stream Now</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {platforms.map(p => (
                    <a key={p.label} href={p.url!} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F5F0E8', border: '1px solid #2A2A2A', padding: '10px 18px', textDecoration: 'none', transition: 'all 200ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLAnchorElement).style.color = '#F5F0E8' }}>
                      {p.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <Link href={`/releases/${release.slug}`} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none' }}>
              More About This Release →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 8 — `components/events/EventCard.tsx`

```tsx
'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Event } from '@prisma/client'

export default function EventCard({ event }: { event: Event }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/events/${event.id}`)}
      style={{ background: '#0F0F0F', border: '1px solid #1E1E1E', overflow: 'hidden', cursor: 'pointer', transition: 'all 300ms ease', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E1E'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', flexShrink: 0 }}>
        {event.posterImage ? (
          <Image src={event.posterImage} alt={event.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0d0a02, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, opacity: 0.12 }}>🎷</span>
          </div>
        )}
        
        {/* Status */}
        <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '4px 10px', background: event.status === 'UPCOMING' ? '#C9A84C' : '#1A1A1A', color: event.status === 'UPCOMING' ? '#080808' : '#444' }}>
          {event.status}
        </span>
        
        {/* Date */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(8,8,8,0.9)', padding: '10px 16px', borderTop: '1px solid #2A2A2A', borderRight: '1px solid #2A2A2A' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, color: '#C9A84C', lineHeight: 1, margin: 0 }}>
            {new Date(event.eventDate).getDate()}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', margin: '3px 0 0' }}>
            {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
      
      {/* Body */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: '#F5F0E8', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {event.title}
        </h3>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#555', margin: 0 }}>
          {event.venue} · {event.city}
        </p>
        {event.eventTime && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#333', marginTop: 4 }}>
            {event.eventTime}
          </p>
        )}
      </div>
      
      {/* Footer */}
      <div style={{ padding: '16px 20px', marginTop: 16, borderTop: '1px solid #141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#C9A84C' }}>
          {event.isFree ? 'FREE' : `₦${(event.ticketPrice ?? 0).toLocaleString()}`}
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 16px' }}>
          {event.isFree ? 'Register' : 'Get Tickets'}
        </span>
      </div>
    </div>
  )
}
```

---

## STEP 9 — `components/home/UpcomingEvents.tsx`

```tsx
import Link from 'next/link'
import EventCard from '@/components/events/EventCard'
import { prisma } from '@/lib/prisma'

export default async function UpcomingEvents() {
  const events = await prisma.event.findMany({ where: { status: 'UPCOMING' }, orderBy: { eventDate: 'asc' }, take: 3 })

  return (
    <section style={{ background: '#080808', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
              On Stage
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,7vw,88px)', fontWeight: 700, lineHeight: 0.92, margin: 0 }}>
              <span style={{ display: 'block', color: '#F5F0E8' }}>Catch BeeJay</span>
              <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Live.</span>
            </h2>
          </div>
          <Link href="/events" className="hidden md:block" style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 24px' }}>
            View All Events →
          </Link>
        </div>
        
        {/* Grid */}
        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontStyle: 'italic', color: 'rgba(245,240,232,0.2)', marginBottom: 16 }}>No upcoming events</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#333' }}>New dates coming soon. Stay tuned.</p>
          </div>
        )}
        
        {/* Mobile CTA */}
        <div className="md:hidden" style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/events" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 28px', display: 'inline-block' }}>
            View All Events →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 10 — `components/home/GalleryStrip.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
]

export default async function GalleryStrip() {
  const dbImages = await prisma.galleryImage.findMany({ take: 16, orderBy: { sortOrder: 'asc' } })
  const images = dbImages.length >= 4 ? dbImages.map(i => i.imagePath) : DEMO_IMAGES
  const doubled = [...images, ...images, ...images, ...images]

  return (
    <section style={{ background: '#080808', paddingTop: 80, paddingBottom: 80, overflow: 'hidden' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C' }}>
          Moments
        </p>
      </div>
      
      {/* Row 1 — left */}
      <div style={{ overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, animation: 'marquee 40s linear infinite', width: 'max-content' }}>
          {doubled.map((src, i) => (
            <div key={i} style={{ flexShrink: 0, width: 280, height: 180, position: 'relative', overflow: 'hidden' }}>
              <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="280px" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Row 2 — right */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 12, animation: 'marquee 50s linear infinite reverse', width: 'max-content' }}>
          {[...doubled].reverse().map((src, i) => (
            <div key={i} style={{ flexShrink: 0, width: 280, height: 180, position: 'relative', overflow: 'hidden' }}>
              <Image src={src} alt="" fill style={{ objectFit: 'cover' }} sizes="280px" />
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/gallery" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 28px', display: 'inline-block' }}>
          View Full Gallery →
        </Link>
      </div>
    </section>
  )
}
```

---

## STEP 11 — `components/home/TestimonialsSection.tsx`

```tsx
const QUOTES = [
  { quote: "BeeJay Sax carries a rare gift — when he plays, heaven draws near.", name: "Pastor", role: "Night of Worship" },
  { quote: "One of the most spirit-led saxophonists we've hosted at The Experience.", name: "Event Organiser", role: "The Experience" },
  { quote: "His Online Praise Party became our family's weekly sanctuary during lockdown.", name: "Audience Member", role: "United Kingdom" },
]

export default function TestimonialsSection() {
  return (
    <section style={{ background: '#0F0F0F', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
          They Say
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, lineHeight: 1.05, color: '#F5F0E8', margin: '0 0 64px' }}>
          The Sound Speaks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: '1px solid #1E1E1E' }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{ padding: '48px 36px', position: 'relative', borderRight: i < 2 ? '1px solid #1E1E1E' : 'none' }}
                 className={i < 2 ? 'border-b md:border-b-0 border-[#1E1E1E]' : ''}>
              <span style={{ position: 'absolute', top: 20, right: 24, fontFamily: 'var(--font-serif)', fontSize: 72, color: 'rgba(201,168,76,0.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>"</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', lineHeight: 1.7, color: 'rgba(245,240,232,0.8)', marginBottom: 32, position: 'relative' }}>
                &ldquo;{q.quote}&rdquo;
              </p>
              <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
                <div style={{ width: 24, height: 1, background: '#C9A84C', marginBottom: 10 }} />
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 4px' }}>{q.name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#444', margin: 0 }}>{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 12 — `components/home/ContactCTA.tsx`

```tsx
import Link from 'next/link'

export default function ContactCTA() {
  return (
    <section style={{ background: '#080808', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12" style={{ textAlign: 'center' }}>
        
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 20 }}>
          Get In Touch
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,7vw,96px)', fontWeight: 700, lineHeight: 0.92, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          <span style={{ display: 'block', color: '#F5F0E8' }}>Let&apos;s Create</span>
          <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Something Sacred.</span>
        </h2>
        
        <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '32px auto' }} />
        
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.8, color: 'rgba(245,240,232,0.5)', maxWidth: 480, margin: '0 auto 48px' }}>
          Available for concerts, corporate events, gospel conferences, and collaborations — within Nigeria and internationally.
        </p>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link href="/contact?inquiry=booking" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#080808', background: '#C9A84C', padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }}>
            Book BeeJay
          </Link>
          <Link href="/contact" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5F0E8', background: 'transparent', border: '1px solid rgba(245,240,232,0.25)', padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }}>
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
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#444' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 13 — `app/(site)/page.tsx`

```tsx
import Hero from '@/components/home/Hero'
import AboutTeaser from '@/components/home/AboutTeaser'
import FeaturedRelease from '@/components/home/FeaturedRelease'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import VideoSection from '@/components/home/VideoSection'
import GalleryStrip from '@/components/home/GalleryStrip'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactCTA from '@/components/home/ContactCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <FeaturedRelease />
      <UpcomingEvents />
      <VideoSection />
      <GalleryStrip />
      <TestimonialsSection />
      <ContactCTA />
    </>
  )
}
```

Note: Hero has `marginTop: -72` to make it full screen. All other sections benefit from the layout paddingTop: 72.

---

## STEP 14 — `components/home/VideoSection.tsx`

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const VIDEOS = [
  { id: '0jxRD456j_w', title: 'BeeJay Sax Live in London, Indigo O2' },
  { id: 'z4saapf2BrA', title: 'BeeJay Sax at House on the Rock (TAPE 2022)' },
]

function VideoCard({ video, large = false }: { video: typeof VIDEOS[0], large?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const thumb = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
  
  return (
    <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', background: '#0F0F0F', cursor: 'pointer' }} onClick={() => setPlaying(true)}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <>
          <Image src={thumb} alt={video.title} fill style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: large ? 64 : 44, height: large ? 64 : 44, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 200ms' }}>
              <svg width={large ? 20 : 14} height={large ? 20 : 14} viewBox="0 0 24 24" fill="#080808">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 100%)', padding: '24px 16px 16px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#F5F0E8', margin: 0 }}>{video.title}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function VideoSection() {
  return (
    <section style={{ background: '#080808', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
          Watch
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, lineHeight: 1.05, color: '#F5F0E8', margin: '0 0 48px' }}>
          <span style={{ display: 'block' }}>Experience The</span>
          <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Performance.</span>
        </h2>
        
        {VIDEOS[0] && (
          <div style={{ marginBottom: 12 }}>
            <VideoCard video={VIDEOS[0]} large />
          </div>
        )}
        
        {VIDEOS.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {VIDEOS.slice(1).map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="https://youtube.com/@beejaysax" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 28px', display: 'inline-block' }}>
            View All Videos →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 15 — After all home components, fix remaining pages

### `app/(site)/events/page.tsx`
```
Page header:
  height: 320px, position relative, overflow hidden
  background: #0F0F0F
  borderBottom: 1px solid #1E1E1E
  
  Content inside: position absolute, bottom 48, left 0, right 0
    Container: max-w-[1200px] mx-auto px-6 md:px-12
    Section label: "Events"
    H1: "On Stage." — h1 inline style, fontSize clamp(48px,8vw,96px)

Tab toggle (sticky, top 72, z-30):
  bg #080808, borderBottom 1px solid #1E1E1E
  height 52px
  Container: max-w-[1200px] mx-auto px-6 md:px-12
  Two tab buttons: Upcoming | Past
  Active: color #C9A84C, borderBottom 2px solid #C9A84C

Events grid:
  Container: max-w-[1200px] mx-auto px-6 md:px-12 py-16
  display grid, gridTemplateColumns repeat(auto-fill, minmax(320px, 1fr)), gap 20
```

### `app/(site)/releases/page.tsx`
```
Page header: same style as events, H1: "The Music."
Filter tabs: All | Singles | Albums | EPs (client-side)
Grid: max-w-[1200px] mx-auto px-6 md:px-12 py-16
      grid-cols-2 md:grid-cols-3 lg:grid-cols-4, gap 20

Each release card:
  bg #0F0F0F, border 1px solid #1E1E1E
  hover: border #C9A84C, translateY -3px
  
  Image: aspectRatio 1/1, overflow hidden, position relative
  
  Body: padding 16px
    Type badge: 9px uppercase tracking gold, border gold/30, padding 3px 10px
    Title: Playfair 16px #F5F0E8
    Year: DM Sans 11px #444
    Streaming icons row: just text links, gap 12, fontSize 10px, color #333
```

### `app/(site)/gallery/page.tsx`
```
Page header: same style, H1: "Moments."
Filter tabs: All | Performance | Portrait | Events | Backstage

Masonry grid:
  Container: max-w-[1200px] mx-auto px-6 md:px-12 py-16
  columns: 2 (mobile), 3 (md), 4 (lg)
  gap: 12px
  
  Each image: break-inside-avoid, mb-3, position relative, overflow hidden
    Hover: scale 1.03, brightness 1.1
    Lightbox on click
```

### `app/(site)/about/page.tsx`
```
HERO section:
  height 480px, position relative, overflow hidden
  background #0F0F0F, borderBottom 1px solid #1E1E1E
  
  Content: position absolute, bottom 56, left 0, right 0
    Container: max-w-[1200px] mx-auto px-6 md:px-12
    Section label: "The Artist"
    H1 Playfair clamp(48px,8vw,96px):
      "Abolaji David" block
      "Banjoko." block color #C9A84C italic

Bio section: paddingTop 100, paddingBottom 100
  Container: max-w-[1200px] mx-auto px-6 md:px-12
  grid grid-cols-1 md:grid-cols-3 gap-16
  Left col: "THE ORIGIN" label, "Since 2000", large faded 2000
  Right col (col-span-2): bio paragraphs

Performances section:
  bg #0F0F0F, borderY 1px solid #1E1E1E, py-24
  Container: max-w-[1200px] mx-auto px-6 md:px-12
  grid grid-cols-1 md:grid-cols-3 gap-4
  Each card: bg #080808, border #1E1E1E, padding 24px
    Title: Playfair 18px, Year: gold label, Description: body text
```

### Contact page
```
paddingTop on outermost container: 80px (extra above navbar clearance)

grid grid-cols-1 lg:grid-cols-2 gap-16
Container: max-w-[1200px] mx-auto px-6 md:px-12 py-24

LEFT:
  "REACH OUT" label
  H1: "Let's Talk." — Playfair clamp(48px,7vw,88px)
  Gold rule
  Contact items with icons
  Social text links

RIGHT:
  Form with all fields
  All inputs: bg #0F0F0F, border 1px solid #1E1E1E, padding 14px 16px
              focus: border #C9A84C, outline none
  Submit: full-width gold button
```

---

## FINAL STEPS

After all files are written:

```bash
npm run build
```

If build passes:
```bash
git add .
git commit -m "Total redesign — clean rebuild"
git push
```

Report:
- Files changed (list them)
- Build: PASS or FAIL
- Any errors

---

*BeeJay Sax — Total Rebuild*
*SonsHub Media Ltd.*
