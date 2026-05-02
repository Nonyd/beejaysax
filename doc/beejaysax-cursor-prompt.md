# 🎷 BEEJAY SAX — OFFICIAL WEBSITE REDESIGN
## Complete Cursor AI Build Prompt
### Next.js 15 · TypeScript · Tailwind CSS v4 · Prisma · Neon PostgreSQL · GSAP 3 · Lenis · QR Ticket System

---

## PART 1 — PROJECT CONTEXT & IDENTITY

**Client:** BeeJay Sax (real name: Abolaji David Banjoko)
**Role:** Gospel Saxophonist · Music Minister · Singer · Event Convener
**Brand line:** "Blessed & Highly Favoured."
**Origin:** Mechanical Engineering graduate, Ogun State University → left engineering for full-time music ministry
**Church:** RCCG member since 2000, first album released 2012
**Discography:** 2 albums — Praise Session 1, Modupeoluwa, Joyful Praise (singles/albums)
**Notable stages:** The Experience · Beejay Sax Live Concert · Night of Worship
**Notable collaborations:** Donnie McClurkin · Nathaniel Bassey · Travis Greene · Buster Rhymes (Canirivs 2010)
**Notable events:** 2010 Lagos Kuramo International Conference · Afromedia 50th Anniversary · Indigo O2 London
**Signature initiative:** Online Praise Party (pandemic-era online praise series)
**Signature event:** Beejay Sax Live Concert (annual gospel event — next date: 24th May 2026, 5PM, Eko Hotels and Suites)

**Design brief:** Replace the dated WordPress site (beejaysax.com) with a world-class editorial music platform. The site should feel like what you'd get if Vogue and a gospel cathedral had a digital child — sacred, cinematic, commanding. Black silence. Gold breath. White light.

**Design reference:** jubriloflagos.com — editorial section storytelling, oversized serif headings that break intentionally across lines, section label tags ("The Origin", "The Legacy"), horizontal marquee tickers, auto-scrolling image strips, scroll-driven reveals, minimal nav, maximum whitespace.

---

## PART 2 — TECH STACK

```
Framework:       Next.js 15 (App Router, TypeScript strict mode)
Styling:         Tailwind CSS v4
Database:        Neon.tech (Serverless PostgreSQL)
ORM:             Prisma 5
Auth:            NextAuth.js v5 (admin panel only, credentials provider)
Animations:      GSAP 3 + ScrollTrigger + SplitText (installed via npm)
Smooth Scroll:   Lenis v1 (@studio-freight/lenis)
QR Codes:        qrcode (npm package) for ticket generation
Email:           Resend (for contact form + ticket delivery)
Image Hosting:   Cloudinary (for gallery/event poster uploads via SDK)
Fonts:           next/font/google — Playfair Display + DM Sans
Icons:           Lucide React
Deployment:      Vercel (staging → production)
Future:          Webuzo VPS (production migration — keep Docker-ready structure)
```

**Install command:**
```bash
npx create-next-app@latest beejaysax --typescript --tailwind --app --src-dir=false
cd beejaysax
npm install prisma @prisma/client @auth/prisma-adapter next-auth@beta
npm install gsap @studio-freight/lenis
npm install qrcode @types/qrcode
npm install cloudinary
npm install resend
npm install lucide-react
npm install slugify date-fns
npx prisma init
```

---

## PART 3 — DESIGN SYSTEM

### 3.1 Color Palette

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bjs-black':     '#080808',
        'bjs-surface':   '#0F0F0F',
        'bjs-surface2':  '#161616',
        'bjs-surface3':  '#1E1E1E',
        'bjs-border':    '#2A2A2A',
        'bjs-border-lt': '#3A3A3A',
        'bjs-white':     '#F5F0E8',   // warm parchment white
        'bjs-white-dim': 'rgba(245,240,232,0.6)',
        'bjs-gold':      '#C9A84C',
        'bjs-gold-lt':   '#E8C96D',
        'bjs-gold-dim':  'rgba(201,168,76,0.10)',
        'bjs-gold-glow': 'rgba(201,168,76,0.25)',
        'bjs-muted':     '#555555',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee':       'marquee 40s linear infinite',
        'marquee-fast':  'marquee 25s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'pulse-gold':    'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(201,168,76,0.2)' },
        },
      },
    },
  },
}

export default config
```

### 3.2 Typography

```ts
// lib/fonts.ts
import { Playfair_Display, DM_Sans } from 'next/font/google'

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})
```

**Typography scale (use as Tailwind classes or CSS vars):**

| Role           | Size                        | Font             | Weight | Style   | Tracking       | Line-height |
|----------------|-----------------------------|------------------|--------|---------|----------------|-------------|
| Display        | clamp(72px, 12vw, 170px)    | Playfair Display | 700    | italic  | -0.02em        | 0.86        |
| H1             | clamp(52px, 9vw, 120px)     | Playfair Display | 700    | normal  | -0.02em        | 0.90        |
| H2             | clamp(38px, 6vw, 80px)      | Playfair Display | 600    | normal  | -0.01em        | 0.95        |
| H3             | clamp(24px, 3vw, 40px)      | Playfair Display | 500    | normal  | 0              | 1.2         |
| Section Label  | 11px                        | DM Sans          | 500    | normal  | 0.28em         | 1           |
| Body           | 16px                        | DM Sans          | 400    | normal  | 0              | 1.75        |
| Caption        | 13px                        | DM Sans          | 400    | normal  | 0.05em         | 1.6         |
| Nav            | 11px                        | DM Sans          | 500    | normal  | 0.20em         | 1           |
| Quote          | clamp(20px, 3vw, 32px)      | Playfair Display | 400    | italic  | 0              | 1.5         |
| Stat Number    | clamp(48px, 7vw, 96px)      | Playfair Display | 700    | normal  | -0.02em        | 1           |

### 3.3 Global CSS (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans:  'DM Sans', system-ui, sans-serif;
}

html {
  background: #080808;
  color: #F5F0E8;
  scroll-behavior: auto; /* Lenis handles this */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background: #080808;
  color: #F5F0E8;
  overflow-x: hidden;
}

/* Text selection */
::selection {
  background: #C9A84C;
  color: #080808;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-track { background: #0F0F0F; }
::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 1px; }

/* Grain texture overlay on body */
body::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  z-index: 9999;
}

/* Reusable utility classes */
.section-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #C9A84C;
}

.gold-rule {
  width: 48px;
  height: 1px;
  background: #C9A84C;
  display: block;
}

.gold-rule-full {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, #C9A84C, transparent);
  display: block;
}

/* Page transition wrapper */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}
```

---

## PART 4 — FILE & FOLDER STRUCTURE

```
beejaysax/
├── app/
│   ├── globals.css
│   ├── layout.tsx                        ← root layout
│   ├── page.tsx                          ← homepage
│   ├── about/
│   │   └── page.tsx
│   ├── releases/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx                  ← event detail + ticket purchase
│   ├── tickets/
│   │   └── [ticketId]/
│   │       └── page.tsx                  ← ticket view with QR code
│   ├── gallery/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── admin/
│       ├── layout.tsx                    ← admin shell, auth guard
│       ├── page.tsx                      ← dashboard
│       ├── events/
│       │   ├── page.tsx                  ← events list
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── edit/page.tsx
│       │       └── tickets/page.tsx      ← ticket list + QR scanner view
│       ├── releases/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── gallery/
│       │   └── page.tsx
│       └── messages/
│           └── page.tsx
│
├── api/                                  ← Next.js route handlers
│   └── app/api/
│       ├── auth/[...nextauth]/route.ts
│       ├── events/
│       │   ├── route.ts                  ← GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts              ← GET, PUT, DELETE
│       │       └── tickets/route.ts      ← GET tickets for event
│       ├── releases/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── gallery/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── tickets/
│       │   ├── purchase/route.ts         ← POST: create ticket registration
│       │   └── [ticketId]/
│       │       ├── route.ts              ← GET ticket data
│       │       └── verify/route.ts       ← POST: mark as used (QR scan)
│       ├── contact/route.ts
│       └── upload/route.ts               ← Cloudinary signed upload
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── CustomCursor.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── AboutTeaser.tsx
│   │   ├── FeaturedRelease.tsx
│   │   ├── UpcomingEvents.tsx
│   │   ├── VideoSection.tsx
│   │   ├── GalleryStrip.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── ContactCTA.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventHero.tsx
│   │   └── TicketRegistrationForm.tsx
│   ├── tickets/
│   │   ├── TicketCard.tsx                ← the beautiful printable/shareable ticket
│   │   └── QRCodeDisplay.tsx
│   ├── releases/
│   │   ├── ReleaseCard.tsx
│   │   └── ReleaseFilter.tsx
│   ├── gallery/
│   │   ├── GalleryGrid.tsx
│   │   └── Lightbox.tsx
│   ├── ui/
│   │   ├── GoldButton.tsx
│   │   ├── OutlineButton.tsx
│   │   ├── SectionLabel.tsx
│   │   ├── GoldRule.tsx
│   │   ├── Marquee.tsx
│   │   ├── StatCard.tsx
│   │   └── Toast.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── StatsCard.tsx
│   │   └── DataTable.tsx
│   └── providers/
│       ├── LenisProvider.tsx
│       └── SessionProvider.tsx
│
├── lib/
│   ├── fonts.ts
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── resend.ts
│   ├── qrcode.ts                         ← QR generation helpers
│   ├── utils.ts
│   └── animations.ts                     ← reusable GSAP helpers
│
├── prisma/
│   └── schema.prisma
│
├── types/
│   └── index.ts                          ← shared TypeScript types
│
├── public/
│   ├── images/
│   │   └── placeholder-hero.jpg
│   └── icons/
│       └── saxophone.svg
│
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## PART 5 — DATABASE SCHEMA (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────

model Event {
  id           String      @id @default(cuid())
  title        String
  description  String?
  venue        String
  address      String?
  city         String
  country      String      @default("Nigeria")
  eventDate    DateTime
  eventTime    String?
  ticketPrice  Float?
  isFree       Boolean     @default(false)
  totalTickets Int?        // null = unlimited
  posterImage  String?     // Cloudinary URL
  isFeatured   Boolean     @default(false)
  status       EventStatus @default(UPCOMING)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  tickets      Ticket[]
}

enum EventStatus {
  UPCOMING
  PAST
  CANCELLED
}

// ─────────────────────────────────────────
// TICKETS (QR SYSTEM)
// ─────────────────────────────────────────

model Ticket {
  id           String       @id @default(cuid())
  ticketNumber String       @unique  // e.g. "BJS-2026-0042"
  eventId      String
  event        Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  // Attendee info
  firstName    String
  lastName     String
  email        String
  phone        String?
  
  // Ticket details
  ticketType   TicketType   @default(GENERAL)
  quantity     Int          @default(1)
  totalAmount  Float        @default(0)
  
  // QR & verification
  qrCode       String       @unique  // base64 QR code data URI
  qrToken      String       @unique  // unique token encoded in QR
  isUsed       Boolean      @default(false)
  usedAt       DateTime?
  usedByAdmin  String?      // admin username who scanned
  
  // Payment (for future Paystack integration)
  paymentStatus PaymentStatus @default(PENDING)
  paymentRef    String?
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

enum TicketType {
  GENERAL
  VIP
  VVIP
  FREE
}

enum PaymentStatus {
  PENDING
  PAID
  FREE
  REFUNDED
}

// ─────────────────────────────────────────
// RELEASES
// ─────────────────────────────────────────

model Release {
  id            String      @id @default(cuid())
  title         String
  slug          String      @unique
  releaseType   ReleaseType @default(SINGLE)
  description   String?
  coverImage    String?     // Cloudinary URL
  spotifyUrl    String?
  appleMusicUrl String?
  youtubeUrl    String?
  audiomackUrl  String?
  boomplayUrl   String?
  releaseDate   DateTime?
  isFeatured    Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum ReleaseType {
  SINGLE
  ALBUM
  EP
}

// ─────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────

model GalleryImage {
  id        String          @id @default(cuid())
  imagePath String          // Cloudinary URL
  caption   String?
  category  GalleryCategory @default(PERFORMANCE)
  sortOrder Int             @default(0)
  width     Int?
  height    Int?
  createdAt DateTime        @default(now())
}

enum GalleryCategory {
  PERFORMANCE
  PORTRAIT
  EVENTS
  BACKSTAGE
}

// ─────────────────────────────────────────
// VIDEOS
// ─────────────────────────────────────────

model Video {
  id          String   @id @default(cuid())
  title       String
  youtubeId   String
  description String?
  isFeatured  Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}

// ─────────────────────────────────────────
// CONTACT MESSAGES
// ─────────────────────────────────────────

model ContactMessage {
  id          String      @id @default(cuid())
  name        String
  email       String
  phone       String?
  inquiryType InquiryType @default(GENERAL)
  subject     String
  message     String
  isRead      Boolean     @default(false)
  createdAt   DateTime    @default(now())
}

enum InquiryType {
  BOOKING
  COLLABORATION
  MEDIA
  GENERAL
}

// ─────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

---

## PART 6 — ENVIRONMENT VARIABLES (`.env.local`)

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/beejaysax?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://username:password@ep-xxx.neon.tech/beejaysax?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# Resend (email)
RESEND_API_KEY=""
EMAIL_FROM="noreply@beejaysax.com"
ADMIN_EMAIL="admin@beejaysax.com"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## PART 7 — CORE LIBRARY FILES

### `lib/prisma.ts`
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### `lib/qrcode.ts`
```ts
import QRCode from 'qrcode'
import { randomBytes } from 'crypto'

export function generateQRToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateTicketNumber(index: number): string {
  const year = new Date().getFullYear()
  const padded = String(index).padStart(4, '0')
  return `BJS-${year}-${padded}`
}

export async function generateQRCodeDataURL(token: string, baseUrl: string): Promise<string> {
  const verifyUrl = `${baseUrl}/tickets/${token}`
  return await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    color: {
      dark: '#080808',
      light: '#F5F0E8',
    },
    width: 300,
  })
}
```

### `lib/animations.ts`
```ts
// Reusable GSAP animation helpers
// Import and use in client components

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

export function registerGSAP() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
  }
}

// Reveal heading with character split animation
export function revealHeading(element: HTMLElement, delay = 0) {
  const split = new SplitText(element, { type: 'chars,words' })
  return gsap.from(split.chars, {
    y: 100,
    opacity: 0,
    rotateX: -90,
    stagger: 0.035,
    duration: 1.0,
    ease: 'power4.out',
    delay,
  })
}

// Fade up reveal on scroll
export function fadeUpOnScroll(elements: HTMLElement | HTMLElement[] | string, stagger = 0.1) {
  return gsap.from(elements, {
    y: 60,
    opacity: 0,
    stagger,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: typeof elements === 'string' ? elements : (elements as HTMLElement[])[0],
      start: 'top 85%',
      once: true,
    },
  })
}

// Horizontal slide reveal
export function slideInFromLeft(element: HTMLElement) {
  return gsap.from(element, {
    x: -80,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}

export function slideInFromRight(element: HTMLElement) {
  return gsap.from(element, {
    x: 80,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}

// Scale in on scroll
export function scaleInOnScroll(element: HTMLElement) {
  return gsap.from(element, {
    scale: 0.88,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      once: true,
    },
  })
}

// Parallax on scroll
export function parallaxElement(element: HTMLElement, speed = 0.5) {
  return gsap.to(element, {
    y: () => element.offsetHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
}

// Counter animation
export function animateCounter(element: HTMLElement, target: number, duration = 2) {
  const obj = { val: 0 }
  return gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toString()
    },
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}
```

### `components/providers/LenisProvider.tsx`
```tsx
'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
```

---

## PART 8 — ROOT LAYOUT (`app/layout.tsx`)

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { playfair, dmSans } from '@/lib/fonts'
import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/layout/CustomCursor'

export const metadata: Metadata = {
  title: {
    default: 'BeeJay Sax — Gospel Saxophonist & Music Minister',
    template: '%s | BeeJay Sax',
  },
  description: 'Official website of BeeJay Sax — Nigerian gospel saxophonist, convener of BeeJay Sax Live Concert, and music minister. Blessed & Highly Favoured.',
  keywords: ['BeeJay Sax', 'gospel saxophonist', 'Nigerian gospel music', 'music minister', 'Abolaji David Banjoko'],
  openGraph: {
    title: 'BeeJay Sax',
    description: 'Gospel Saxophonist · Music Minister · Blessed & Highly Favoured.',
    url: 'https://beejaysax.com',
    siteName: 'BeeJay Sax',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@beejaysaxbolaji',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bjs-black text-bjs-white font-sans antialiased overflow-x-hidden">
        <LenisProvider>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  )
}
```

---

## PART 9 — COMPONENT SPECIFICATIONS

### `components/layout/CustomCursor.tsx`
```
'use client' component. Only render on devices with hover capability.

Two elements:
1. cursor-dot: 8px circle, bg-bjs-gold, rounded-full, fixed, pointer-events-none, z-[9998]
2. cursor-ring: 36px circle, border border-bjs-gold, rounded-full, fixed, pointer-events-none, z-[9997]

useEffect:
- mousemove: update dot position instantly (no lerp)
- cursor-ring: lerp to mouse position (lerp factor 0.10) using requestAnimationFrame
- On mouseenter [a, button, [data-cursor]]: ring scale 1.8, fill bjs-gold-dim, dot scale 0
- On mouseleave: ring scale 1, fill transparent, dot scale 1
- Hide both when mouse leaves window (mouseleave on document)

CSS transition on ring: transform 0.1s ease for scale only
```

### `components/layout/Navbar.tsx`
```
'use client', fixed top-0 left-0 w-full z-50

State: scrolled (bool), menuOpen (bool)

Default: transparent background, no border
Scrolled (>80px): bg-bjs-black/95 backdrop-blur-md border-b border-bjs-border
Transition: all 400ms ease

Left side:
  Logo mark: two-part wordmark
  - "BEEJAY" → DM Sans, 13px, font-weight 600, tracking-[0.18em], uppercase, text-bjs-white
  - " SAX" → Playfair Display, 14px, italic, text-bjs-gold
  Links to /

Center (desktop only, hidden <1024px):
  Nav links: Home · Releases · Events · Gallery · About · Contact
  11px, DM Sans, tracking-[0.18em], uppercase
  Active: text-bjs-gold
  Hover: text-bjs-gold, transition 300ms
  Each link has a gold dot (2px circle) beneath that scales in on hover/active

Right side (desktop):
  [Book BeeJay] → /contact?inquiry=booking
  Gold outline button: border border-bjs-gold text-bjs-gold
  11px, uppercase, tracking-[0.15em], px-5 py-2.5
  Hover: bg-bjs-gold text-bjs-black transition 300ms

Mobile hamburger (<1024px):
  3-line icon → animates to X on open
  Opens fullscreen overlay: bg-bjs-black, z-50
  Nav links stagger in from y:40, opacity:0 with GSAP
  Each link: Playfair Display, 48px, text-bjs-white, hover text-bjs-gold
  Gold rule between each link
  Bottom: social icons row + "Book BeeJay" gold button
```

### `components/layout/Footer.tsx`
```
bg-bjs-black, top border: 1px solid bjs-border

Layout (stacked):
  
  Row 1 (py-16):
    Center: "BEEJAY SAX" wordmark — Playfair Display, 80px, italic
    Below: "Blessed & Highly Favoured." in section-label style, gold
    
  Row 2 (py-8, border-t border-bjs-border):
    Left: nav links in a row (Home · Releases · Events · Gallery · About · Contact)
           11px, DM Sans, uppercase, tracking-wide, muted, hover gold
    Right: social icons (Instagram, YouTube, Facebook, Spotify, TikTok)
           Use Lucide icons or inline SVGs, 18px, muted, hover gold, transition 300ms
    
  Row 3 (py-6, border-t border-bjs-border):
    Left: © 2025 BeeJay Sax. All rights reserved.
    Right: Designed by SonsHub Media (link to sonshubmedia.com, gold on hover)
    
  Both in 11px, DM Sans, text-bjs-muted
```

### `components/ui/Marquee.tsx`
```tsx
// Props: { text: string; speed?: number; direction?: 'left' | 'right'; className?: string }

// Render the text string 3x in a row inside a container
// Use CSS animation: marquee (from tailwind keyframes)
// Pause on hover via: group-hover:[animation-play-state:paused]
// Separator between each item: gold diamond ◆ with mx-6 spacing
// Full width overflow hidden container
// Font: DM Sans 11px uppercase tracking-[0.2em] text-bjs-muted
// Gold items: the ◆ separator should be text-bjs-gold
```

### `components/ui/GoldButton.tsx`
```tsx
// Props: { children, href?, onClick?, className?, size?: 'sm' | 'md' | 'lg' }
// Filled gold button
// bg-bjs-gold text-bjs-black font-sans font-semibold uppercase tracking-[0.12em]
// Hover: bg-bjs-gold-lt, scale 1.02, transition all 300ms
// Active: scale 0.98
// Size sm: text-10px px-4 py-2
// Size md: text-11px px-6 py-3 (default)
// Size lg: text-12px px-8 py-4
// If href: render as <Link>
// Else: render as <button>
```

### `components/ui/OutlineButton.tsx`
```tsx
// Same as GoldButton but:
// bg-transparent border border-bjs-gold text-bjs-gold
// Hover: bg-bjs-gold text-bjs-black
```

### `components/ui/SectionLabel.tsx`
```tsx
// Props: { children, className? }
// <p className="section-label">{children}</p>
// Adds gold left-border accent: border-l-2 border-bjs-gold pl-3
```

---

## PART 10 — PAGE SPECIFICATIONS

---

### 10.1 HOMEPAGE (`app/page.tsx`)

Server component. Fetch data:
```ts
const [featuredRelease, upcomingEvents, featuredVideos, galleryImages, featuredEvent] = 
  await Promise.all([
    prisma.release.findFirst({ where: { isFeatured: true }, orderBy: { createdAt: 'desc' } }),
    prisma.event.findMany({ 
      where: { status: 'UPCOMING' }, 
      orderBy: { eventDate: 'asc' }, 
      take: 3 
    }),
    prisma.video.findMany({ 
      where: { isFeatured: true }, 
      orderBy: { sortOrder: 'asc' }, 
      take: 3 
    }),
    prisma.galleryImage.findMany({ 
      where: { category: 'PERFORMANCE' },
      orderBy: { sortOrder: 'asc' }, 
      take: 14 
    }),
    prisma.event.findFirst({ 
      where: { isFeatured: true, status: 'UPCOMING' },
      orderBy: { eventDate: 'asc' }
    }),
  ])
```

Pass data to child client components.

---

#### SECTION 1 — HERO (`components/home/Hero.tsx`)

```
'use client'

Full viewport height: h-[100svh]
Position: relative, overflow-hidden

BACKGROUND:
  next/image fill, objectFit: cover, objectPosition: center top
  Priority: true
  Dark gradient overlay:
    linear-gradient(to bottom, 
      rgba(8,8,8,0.2) 0%, 
      rgba(8,8,8,0.5) 40%, 
      rgba(8,8,8,0.85) 75%, 
      rgba(8,8,8,1) 100%
    )
  Placeholder: deep dark gradient bg-gradient-to-br from-bjs-black via-[#0d0a04] to-bjs-black

CONTENT (centered, z-10, absolute inset-0 flex flex-col items-center justify-center):

  Section label: "GOSPEL SAXOPHONIST · MUSIC MINISTER"
    class="section-label mb-8"
    animate: fade in from y:20, opacity:0 → 0, delay 0.2s

  H1 (two separate lines):
    Line 1: "BeeJay" → font-serif, italic, display size, text-bjs-white
    Line 2: "Sax." → font-serif, italic, display size, text-bjs-gold
    Each line: overflow-hidden wrapper, inner span animates from y:100% to y:0

  Tagline: "Blessed & Highly Favoured."
    font-serif italic, 20px, text-bjs-white/60
    animate: fade in delay 0.9s

  CTA row (mt-12, gap-4, flex flex-wrap justify-center):
    [Upcoming Events] → <GoldButton href="/events" size="lg">
    [Listen Now] → <OutlineButton href="/releases" size="lg">
    animate: fade in from y:30 delay 1.1s

  Scroll indicator (absolute bottom-10 left-1/2 -translate-x-1/2):
    "SCROLL" section-label text
    Animated chevron: bounce animation, gold color
    animate: fade in delay 1.5s

BOTTOM TICKER (absolute bottom-0 left-0 right-0, bg-bjs-surface/80 backdrop-blur-sm, py-3):
  <Marquee text="BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · 
                  BEEJAY SAX LIVE CONCERT · NIGERIA'S FINEST · SPIRIT-FILLED SOUND ·" />

GSAP ANIMATIONS (useEffect after mount):
  registerGSAP()
  - H1 lines: SplitText on each char, stagger from y:100 rotateX:-90 opacity:0
  - ScrollTrigger on entire section for parallax on background image
```

---

#### SECTION 2 — ABOUT TEASER (`components/home/AboutTeaser.tsx`)

```
'use client'
bg-bjs-black, py-32

Layout: grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-8

LEFT (image):
  Aspect ratio 3:4
  next/image, objectFit cover
  Sharp edges (no border-radius)
  Left accent: border-l-[3px] border-bjs-gold
  Subtle image overlay gradient at bottom
  ref: imageRef → slideInFromLeft(imageRef.current)

RIGHT (text):
  Section label: "THE ARTIST" (SectionLabel component)
  
  Heading (2 lines, H2 size):
    "A Sound That"
    "Moves Heaven."
    ref: headingRef → revealHeading on scroll
  
  Gold rule: <span class="gold-rule my-8 block" />
  
  Body text (2 paragraphs):
    P1: "Abolaji David Banjoko — known to the world as BeeJay Sax — is one of Nigeria's 
        most distinctive gospel saxophonists. His spirit-filled tone doesn't just fill rooms; 
        it moves hearts."
    P2: "A graduate of Mechanical Engineering who traded blueprints for ministry, BeeJay 
        has graced the stages of The Experience and Night of Worship alongside Donnie 
        McClurkin, Nathaniel Bassey, and Travis Greene."

  Stats row (3 stats, mt-12):
    "2"    → Albums
    "20+"  → Years in Ministry  
    "3"    → Continents
    Each: large number in Playfair Display gold + label below in 11px DM Sans muted
    GSAP: animateCounter on each number

  CTA: [Full Story →] text link → /about
       text-bjs-gold hover:text-bjs-gold-lt, underline offset
       Arrow animates right on hover

GSAP: slideInFromLeft(imageRef), slideInFromRight(textRef)
```

---

#### SECTION 3 — FEATURED RELEASE (`components/home/FeaturedRelease.tsx`)

```
'use client'
bg-bjs-surface, py-32

Only render if featuredRelease prop is not null.

Section label: "LATEST RELEASE"

Layout: grid grid-cols-1 lg:grid-cols-5 gap-0 max-w-7xl mx-auto

LEFT (col-span-2):
  Cover image: aspect-square, next/image, objectFit cover
  Hover: scale 1.03, transition 600ms ease
  Wrap in overflow-hidden
  GSAP: scaleInOnScroll

RIGHT (col-span-3, px-12 py-16, flex flex-col justify-center):
  Release type badge:
    Small pill: bg-bjs-gold-dim border border-bjs-gold text-bjs-gold
    11px uppercase tracking-wide
    e.g. "ALBUM"

  Title: H2 Playfair Display
  Gold rule
  Description: body text, 3 lines max, text-bjs-white/70
  Release date: caption, text-bjs-muted

  Streaming platforms (mt-8):
    Row of platform pill-buttons:
    Each: dark bg + gold border + platform icon (SVG) + platform name
    Platforms: Spotify · Apple Music · Audiomack · YouTube · Boomplay
    External links, target _blank

  [More About This Release →] text link → /releases/[slug]
```

---

#### SECTION 4 — UPCOMING EVENTS (`components/home/UpcomingEvents.tsx`)

```
'use client'
bg-bjs-black, py-32

Header row (max-w-7xl mx-auto px-8):
  Section label: "ON STAGE"
  
  Heading (2 lines, H1 size):
    "Catch BeeJay"
    "Live."
  
  Right side (desktop only): [View All Events →] outline button → /events

Events grid (mt-16):
  grid grid-cols-1 md:grid-cols-3 gap-6
  Each: <EventCard event={event} />
  GSAP: stagger cards from y:60 opacity:0 on scroll

If no events:
  Centered message: 
    Gold saxophone SVG icon (large)
    "No upcoming events."
    "New dates coming soon. Stay tuned."
    [Get Notified] → /contact?inquiry=general

GSAP: fadeUpOnScroll on heading, stagger on cards
```

**`components/events/EventCard.tsx`:**
```
Props: { event: Event, showViewButton?: boolean }

Card container:
  bg-bjs-surface border border-bjs-border
  hover:border-bjs-gold hover:shadow-[0_0_40px_rgba(201,168,76,0.08)]
  transition all 400ms
  cursor pointer → navigate to /events/[id]
  overflow-hidden

TOP (poster image area):
  If event.posterImage: next/image, aspect 16:9, objectFit cover
  If no posterImage: gradient placeholder 
    bg-gradient-to-br from-bjs-surface2 to-bjs-black
    with large gold saxophone SVG centered (opacity 20%)
  
  Status badge (top-right, absolute):
    UPCOMING: gold bg-bjs-gold text-bjs-black
    CANCELLED: bg-red-900 text-red-200
    PAST: bg-bjs-surface3 text-bjs-muted

DATE BADGE (overlapping bottom of image, absolute bottom-0 left-6):
  bg-bjs-black border border-bjs-border px-4 py-3
  Large day: Playfair Display 42px gold
  Month: DM Sans 11px uppercase tracking-wide muted
  Year: DM Sans 11px muted

BODY (p-6 pt-10):
  Title: H3 Playfair Display, text-bjs-white, line-clamp-2
  Venue: DM Sans 13px text-bjs-muted, mt-2
  City + Country: DM Sans 13px text-bjs-muted
  Time: if event.eventTime, small caption

FOOTER (p-6 pt-0, border-t border-bjs-border mt-4 pt-4):
  Left: Price (if isFree: "FREE ENTRY", else "₦{ticketPrice:,}")
         text-bjs-gold, Playfair Display
  Right: [Get Tickets →] or [View Event →] — GoldButton small

Hover animation: transform translateY(-4px), card shadow grows
```

---

#### SECTION 5 — VIDEO SECTION (`components/home/VideoSection.tsx`)

```
'use client'
bg-bjs-surface, py-32

Section label: "WATCH"
Heading:
  "Experience The"
  "Performance."

Featured video (first in featuredVideos array):
  Large YouTube embed (16:9 aspect ratio)
  Custom play button overlay: 
    Black bg with 60% opacity
    Large gold play circle (70px) centered
    Video title below
    On click: remove overlay, autoplay embed
  YouTube iframe: allow autoplay, encrypted-media, picture-in-picture

Secondary videos row (remaining 2):
  grid grid-cols-2 gap-4 mt-6
  Each: thumbnail (YouTube thumbnail API) + title + play overlay
  Smaller version of same play button treatment

[View All Videos] link at bottom → YouTube channel

GSAP: scaleInOnScroll on featured video, fadeUpOnScroll on secondary
```

---

#### SECTION 6 — GALLERY STRIP (`components/home/GalleryStrip.tsx`)

```
'use client'
bg-bjs-black, py-16
overflow-hidden

Section label centered: "MOMENTS"

Two rows of auto-scrolling images:
  Row 1: scrolls left (animation-marquee)
  Row 2: scrolls right (animation-direction: reverse) — slightly different speed

Each image:
  Width: 280px, Height: 200px, flex-shrink-0
  next/image, objectFit cover
  Hover: scale 1.05, brightness 1.1, transition 400ms
  Gap: mx-3

Images duplicated 3x for seamless loop
Pause entire strip on hover (group-hover:[animation-play-state:paused])

[View Full Gallery →] centered button below
```

---

#### SECTION 7 — TESTIMONIALS (`components/home/TestimonialsSection.tsx`)

```
'use client'
bg-bjs-surface, py-32

Section label: "THEY SAY"
Heading: "The Sound Speaks"

3 quote cards (hardcoded static content):
  Quote 1: "BeeJay Sax carries a rare gift — when he plays, heaven draws near."
           — Pastor at Night of Worship
  Quote 2: "One of the most spirit-led saxophonists we've hosted at The Experience."
           — Event Organiser, The Experience
  Quote 3: "His Online Praise Party became our family's weekly sanctuary during lockdown."
           — Fan, UK

Each card:
  bg-bjs-surface2 border border-bjs-border p-10
  Large gold quote mark (Playfair Display, 120px, opacity 20%, absolute top-4 right-6)
  Quote text: Playfair Display italic, 20px
  Attribution: DM Sans 12px, uppercase, tracking-wide, gold
  Hover: border-bjs-gold

Grid: grid-cols-1 md:grid-cols-3 gap-6

GSAP: stagger cards from y:40 opacity:0
```

---

#### SECTION 8 — CONTACT CTA (`components/home/ContactCTA.tsx`)

```
bg-bjs-black, py-32
border-t border-bjs-border

Full-width editorial section

Section label: "GET IN TOUCH"

Heading (large, center-aligned):
  "Let's Create"
  "Something Sacred."

Body (center, max-w-lg mx-auto):
  "Available for concerts, corporate events, gospel conferences, 
   and collaborations — within Nigeria and internationally."

Two buttons (centered row):
  [Book BeeJay] → GoldButton large → /contact?inquiry=booking
  [Send a Message] → OutlineButton large → /contact

Contact details row (mt-12):
  📍 Lagos, Nigeria
  📞 +234 80 5898 2828
  ✉️ booking@beejaysax.com
  
  Style: DM Sans 13px, text-bjs-muted, icons: text-bjs-gold, gap-8 flex-wrap justify-center

Bottom marquee: scrolling band name ticker
```

---

### 10.2 EVENTS PAGE (`app/events/page.tsx`)

Server component. Fetch:
```ts
const [upcomingEvents, pastEvents] = await Promise.all([
  prisma.event.findMany({ where: { status: 'UPCOMING' }, orderBy: { eventDate: 'asc' } }),
  prisma.event.findMany({ where: { status: 'PAST' }, orderBy: { eventDate: 'desc' }, take: 12 }),
])
```

Page layout:
```
Page header (h-[50vh], relative):
  Background: dark image or gradient
  Overlay gradient to black at bottom
  Section label: "EVENTS"
  H1: "On Stage."
  Tagline: "Gospel events, concerts, and live ministry moments."

Tab toggle (sticky, bg-bjs-surface, border-b border-bjs-border):
  [Upcoming] | [Past]
  Active tab: gold underline, gold text
  Client component for tab state

UPCOMING tab:
  Grid of EventCards (full data)
  If empty: beautiful empty state

PAST tab:
  Grid of EventCards, slightly dimmed (opacity-70)
  "Past Event" overlay badge on images
```

---

### 10.3 EVENT DETAIL PAGE (`app/events/[id]/page.tsx`)

Server component. Fetch event + ticket count:
```ts
const event = await prisma.event.findUnique({ where: { id: params.id } })
const ticketCount = await prisma.ticket.count({ where: { eventId: params.id } })
const availableTickets = event.totalTickets ? event.totalTickets - ticketCount : null
```

Layout:
```
HERO (full-width, h-[60vh]):
  Poster image fill with dark overlay
  Event title large (H1 Playfair)
  Date badge, venue, city

EVENT DETAIL SECTION (grid 2-col):
  LEFT (col-span-2 lg:col-span-3):
    Full description
    What to expect (if description contains it)
    "Featuring BeeJay Sax Live" badge
    Google Maps embed if address available

  RIGHT (col-span-2 lg:col-span-2):
    TICKET CARD:
      bg-bjs-surface border border-bjs-gold
      Sticky (lg:sticky lg:top-24)
      
      Header: "Secure Your Seat" section-label
      Event name (bold)
      Date + Time
      Venue
      
      Availability:
        If unlimited: "Open Registration"
        If limited: show remaining count (warn if <20)
        If free: "FREE ENTRY" gold badge
        If paid: "₦{price:,}" per ticket, Playfair gold
      
      Ticket types (if applicable): General / VIP / VVIP
        Radio select styled as cards
      
      Quantity selector (+/-)
      
      [Register Now] / [Get Tickets] → GoldButton full-width
        → opens TicketRegistrationForm modal/drawer

      Share section: share event on WhatsApp, Twitter/X, copy link
```

---

### 10.4 TICKET REGISTRATION FORM (`components/events/TicketRegistrationForm.tsx`)

```
'use client'
Modal (full-screen overlay on mobile, centered dialog on desktop)
bg-bjs-surface, border border-bjs-border

Header: "Register for [Event Name]"
Gold rule

Fields:
  First Name (required)
  Last Name (required)
  Email Address (required) — ticket sent here
  Phone Number (optional)
  Ticket Type (if event has multiple types): radio cards
  Quantity: 1–10 selector

Summary box:
  Ticket type × quantity
  Total: FREE or ₦{total}
  
[Complete Registration] → GoldButton full-width

On submit:
  POST to /api/tickets/purchase
  Show loading state on button
  
On success:
  Close form
  Show success state:
    Gold checkmark circle animation
    "You're on the list!"
    "Your ticket has been sent to {email}"
    "Check your inbox (and spam folder)"
    [View My Ticket] → /tickets/[ticketId]
    
On error:
  Show error toast with message
```

**`app/api/tickets/purchase/route.ts`:**
```ts
// POST handler
// 1. Validate all fields
// 2. Check if tickets available (if totalTickets set)
// 3. Generate ticketNumber (BJS-YEAR-XXXX using count)
// 4. Generate qrToken (randomBytes hex)
// 5. Generate QR code data URL using generateQRCodeDataURL(token, siteUrl)
// 6. Create Ticket record in DB
// 7. Send ticket email via Resend with QR code embedded
// 8. Return { success: true, ticketId: ticket.id }
```

---

### 10.5 TICKET VIEW PAGE (`app/tickets/[ticketId]/page.tsx`)

Server component. Fetch:
```ts
// ticketId here is actually the qrToken from the URL
const ticket = await prisma.ticket.findUnique({ 
  where: { qrToken: params.ticketId },
  include: { event: true }
})
```

**This is the beautiful digital ticket — designed like a premium physical ticket.**

Layout:
```
Page bg: bg-bjs-black

TICKET CARD (max-w-md mx-auto, mt-16):
  Styled like a physical concert ticket
  bg-bjs-surface
  Gold border: border-2 border-bjs-gold
  Subtle gold glow: shadow-[0_0_60px_rgba(201,168,76,0.15)]
  
  TOP STUB:
    bg-bjs-gold text-bjs-black
    "BEEJAY SAX LIVE" large Playfair Display italic
    "OFFICIAL TICKET" DM Sans 10px uppercase
  
  PERFORATED DIVIDER:
    Dashed border using CSS:
    border-top: 2px dashed rgba(201,168,76,0.4)
    Small circles cut out at edges (CSS trick: 
      ::before and ::after pseudo-elements, 
      circles 20px, bg-bjs-black, positioned at left/right edge)
  
  MAIN BODY (p-8):
    Event poster thumbnail (if exists): 60px × 60px, rounded, float right
    
    Event name: Playfair Display, 22px, text-bjs-white
    
    Info grid (2 columns):
      DATE:     24th May 2026
      TIME:     5:00 PM
      VENUE:    Eko Hotels and Suites
      CITY:     Lagos, Nigeria
    
    Ticket type badge: BJS-GOLD pill
    
    Attendee:
      {firstName} {lastName}
      {email}
    
    Ticket number: DM Sans mono-style, 13px, text-bjs-muted
      "# BJS-2026-0042"
  
  PERFORATED DIVIDER again
  
  QR STUB (bottom, p-8, flex justify-center):
    QR code image (from ticket.qrCode data URL)
    Size: 180×180px on ticket, white bg, padding
    Below QR: "Scan at entrance" — 11px, muted
    Ticket token last 8 chars: text-bjs-muted 10px monospace
    
    If ticket.isUsed:
      Red overlay on QR: "USED" diagonal stamp
      usedAt timestamp

  STATUS FOOTER:
    If isUsed: bg-red-900/20 border-t border-red-900, "This ticket has been used"
    If valid:  bg-green-900/20 border-t border-green-900, "✓ Valid Ticket"

ACTIONS BELOW CARD (mt-8, flex gap-4 justify-center):
  [Download Ticket] → triggers browser print / save as PDF
  [Share on WhatsApp] → wa.me link with event info
  [Add to Calendar] → .ics download link

Print CSS (@media print):
  Hide navbar, footer, action buttons
  Show only ticket card, full width, no margin
  bg-white, text-black (invert for print)
```

---

### 10.6 TICKET VERIFICATION API (`app/api/tickets/[ticketId]/verify/route.ts`)

```ts
// POST { adminKey: string }
// 1. Verify adminKey matches env ADMIN_VERIFY_KEY
// 2. Find ticket by qrToken (params.ticketId)
// 3. If not found: 404
// 4. If already used: return { valid: false, reason: 'already_used', usedAt, usedByAdmin }
// 5. If event date hasn't come yet: warn but still valid (optional config)
// 6. Mark as used: update isUsed=true, usedAt=now()
// 7. Return { valid: true, ticket: { name, ticketType, ticketNumber, eventTitle } }

// Admin can use this endpoint with a simple scanner app or
// navigate to /admin/events/[id]/tickets to scan via camera
```

---

### 10.7 ADMIN TICKET SCANNER (`app/admin/events/[id]/tickets/page.tsx`)

```
'use client'
Admin-only page (protected)

Two tabs: [Ticket List] | [Scanner]

TICKET LIST tab:
  Table: Ticket Number | Name | Email | Type | Status | Registered At
  Status: Green "Valid" or Red "Used"
  Search by name/email/ticket number
  Export CSV button
  Count: "X / Y tickets used"
  
SCANNER tab:
  "Point camera at ticket QR code"
  Uses browser camera API (getUserMedia) or
  a QR scanner library (html5-qrcode)
  
  On scan success:
    Call /api/tickets/[qrToken]/verify
    
    SUCCESS (valid ticket):
      Full green screen flash
      Large ✓ checkmark (animated)
      Attendee name + ticket type
      "Admit ✓" confirmation
      
    ALREADY USED:
      Full red screen flash
      Large ✗ mark
      "Already admitted at {time}"
      
    INVALID:
      Orange warning screen
      "Invalid ticket"
      
  Auto-resets after 3 seconds for next scan
```

---

### 10.8 RELEASES PAGE (`app/releases/page.tsx`)

Server component:
```ts
const releases = await prisma.release.findMany({ orderBy: { releaseDate: 'desc' } })
```

Layout:
```
Page header (same style as Events page):
  Section label: "DISCOGRAPHY"
  H1: "The Music."

Filter tabs (client-side): All | Singles | Albums | EPs
  Smooth JS filter (no page reload), GSAP exit/enter animation on cards

Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto
Each: <ReleaseCard release={release} />

ReleaseCard:
  Square cover image (aspect-square, overflow-hidden)
  Image hover: scale 1.06, gold overlay 15% opacity
  Release type badge: top-left gold pill
  Title: Playfair Display 18px mt-3
  Date: caption, muted, mt-1
  Streaming icons row (mt-2):
    Spotify, Apple Music, Audiomack, YouTube, Boomplay
    18px icons, gold, external links
  [More Info] text link → /releases/[slug]
```

### 10.9 RELEASE DETAIL PAGE (`app/releases/[slug]/page.tsx`)

```
Server component
Fetch: prisma.release.findUnique({ where: { slug } })

Hero: large cover image (left half-width), details right

Details:
  Type badge
  Title (H1)
  Release date
  Description (full)
  
  Streaming section: "Listen Now"
    Each platform as large button:
    Icon + Platform name + "Listen on {platform}"
    bg-bjs-surface2, border bjs-border, hover border-bjs-gold
  
  YouTube embed if youtubeUrl exists (full embed, not just link)
  
  Back link: ← All Releases
```

---

### 10.10 GALLERY PAGE (`app/gallery/page.tsx`)

Server component:
```ts
const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })
```

Layout:
```
Page header: "Moments." H1
Filter tabs: All | Performance | Portrait | Events | Backstage

Masonry grid (CSS columns):
  columns-2 md:columns-3 lg:columns-4 gap-4

Each image:
  next/image (variable height based on natural aspect ratio)
  mb-4 break-inside-avoid
  Hover: brightness 1.1, gold overlay, cursor zoom-in
  On click: open Lightbox

LIGHTBOX (components/gallery/Lightbox.tsx):
  Full-screen overlay bg-bjs-black/96
  Center: current image (max-h-[85vh] max-w-[90vw], objectFit contain)
  Left arrow (prev), Right arrow (next)
  Caption at bottom if exists
  Close: X button top-right, or Escape key
  Keyboard navigation: ← → arrow keys
  Swipe support on mobile (touch events)
  Animate: fade + scale 0.9 → 1.0 on open

GSAP: images fade in with stagger on scroll (lazy trigger)
```

---

### 10.11 ABOUT PAGE (`app/about/page.tsx`)

```
Static page (no DB needed)

HERO SECTION (h-[60vh]):
  Split layout: left half gold bg-bjs-gold-dim, right half image
  Or: full-width portrait image with overlay
  H1: "Abolaji David" / "Banjoko." (Playfair Display, very large)
  Below: "Known as BeeJay Sax"

THE BEGINNING (2-col, text left, image right):
  Section label: "THE ORIGIN"
  Heading: "From Engineering"  "To Ministry."
  Body: Full bio paragraph — Mechanical Engineering graduate, Ogun State → music ministry
  Year chip: "Since 2000" — styled gold pill

THE SOUND (full-width dark section):
  Section label: "THE MINISTRY"
  Heading: "A Sound That"  "Moves Heaven."
  
  3 pillars (grid-cols-3):
    1. "The Saxophone" — "A rich, spirit-filled tone unlike any other in Nigerian gospel"
    2. "The Ministry" — "Over two decades in RCCG, leading worship in prayer and praise"
    3. "The Reach" — "From Lagos to London, touching lives with the sound of heaven"
    
  Each pillar: gold number (01/02/03), title, body, gold bottom rule

NOTABLE PERFORMANCES (timeline style):
  Section label: "MILESTONES"
  
  Timeline items (left line gold, items alternate left/right on desktop):
    2010 — "Buster Rhymes Stage, Canirivs Rivers State Carnival"
    2010 — "Lagos Kuramo International Conference"
    2012 — "Debut Album Release"
    2020 — "Online Praise Party (Pandemic Initiative)"
    2022 — "Beejay Sax Live at House on the Rock (TAPE 2022)"
    2023 — "Beejay Sax Live in London, Indigo O2"
    2026 — "Beejay Sax Live Concert, Eko Hotels and Suites"

COLLABORATIONS SECTION:
  Section label: "ALONGSIDE"
  Heading: "Shared Stages With"
  
  Name ticker (Marquee component, large):
    "DONNIE McCLURKIN · NATHANIEL BASSEY · TRAVIS GREENE · "
  
  Cards (grid-cols-3):
    Each notable co-performer with name + event context

BEEJAY SAX LIVE CONCERT:
  Section label: "THE EVENT"
  Heading: "Beejay Sax Live."
  Body: description of the annual event
  Featured image (concert photo)
  [Buy Tickets] CTA → /events

ONLINE PRAISE PARTY:
  Section label: "THE INITIATIVE"  
  Body: pandemic initiative description
  Social media links

CTA BOTTOM:
  Same ContactCTA component
```

---

### 10.12 CONTACT PAGE (`app/contact/page.tsx`)

```
'use client' (for form handling)

Split layout (2-col on desktop):

LEFT (contact info):
  Section label: "REACH OUT"
  Heading: "Let's Talk."
  Gold rule
  
  Contact items (mt-10, space-y-6):
    📍 Lagos, Nigeria
    📞 +234 80 5898 2828
    ✉️ booking@beejaysax.com
    
  Social links (mt-10):
    Instagram · YouTube · Facebook · Spotify · TikTok
    Each as icon + platform name, gold hover

  Booking note (mt-12, bg-bjs-surface border-l-4 border-bjs-gold px-6 py-4):
    "For international bookings and collaborations, 
     kindly include your country, event type, and preferred dates."

RIGHT (form):
  Form fields:
    First Name + Last Name (2-col grid)
    Email Address (full width)
    Phone Number (full width, optional)
    Inquiry Type (select dropdown):
      Booking Inquiry · Collaboration · Media / Press · General
    Subject (full width)
    Message (textarea, min-h-[180px])
    
  Field styles:
    bg-bjs-surface border border-bjs-border rounded-none
    Focus: border-bjs-gold, outline none
    Label: section-label style above each field
    
  [Send Message] → GoldButton full-width
  
  On submit:
    POST to /api/contact
    Button shows loading spinner (Lucide Loader2, animate-spin)
    Success: green toast "Message sent! We'll be in touch."
    Error: red toast with message
    
  /api/contact/route.ts:
    Validate fields
    Insert to ContactMessage table
    Send notification email to admin via Resend
    Send auto-reply email to sender
    Return { success: true }
```

---

## PART 11 — ADMIN PANEL

### Admin Layout (`app/admin/layout.tsx`)

```ts
// Check session — redirect to /admin/login if not authenticated
// Render AdminSidebar + AdminHeader + {children}
```

### AdminSidebar (`components/admin/AdminSidebar.tsx`)

```
bg-bjs-surface, w-64, min-h-screen, border-r border-bjs-border, fixed left-0

Top: BeeJay Sax logo/wordmark

Nav items (with Lucide icons):
  Dashboard (LayoutDashboard)
  Events (Calendar)
  Tickets (Ticket) — sub-item under Events
  Releases (Music)
  Gallery (Image)
  Messages (Mail) — badge with unread count
  
Bottom: 
  Admin username
  [Log Out] button → /api/auth/signout
  
Active item: bg-bjs-gold-dim border-l-2 border-bjs-gold text-bjs-gold
```

### Admin Dashboard (`app/admin/page.tsx`)

```ts
const stats = await Promise.all([
  prisma.event.count({ where: { status: 'UPCOMING' } }),
  prisma.event.count(),
  prisma.ticket.count(),
  prisma.ticket.count({ where: { isUsed: true } }),
  prisma.release.count(),
  prisma.galleryImage.count(),
  prisma.contactMessage.count({ where: { isRead: false } }),
])
```

```
Stats cards grid (4 cols):
  Upcoming Events | Total Tickets Sold | Tickets Used | Unread Messages
  Each: bg-bjs-surface border border-bjs-border p-6
  Large number (Playfair gold) + label + subtle trend indicator

Quick actions row:
  [+ New Event] [+ New Release] [Upload Photos] [View Messages]
  Each: OutlineButton

Recent activity feed:
  Last 5 ticket registrations
  Last 5 contact messages
  Each as a table row with timestamp
```

### Admin Events (`app/admin/events/page.tsx`)

```
Header row: "Events" H2 + [+ New Event] GoldButton → /admin/events/new

Table:
  Columns: Poster | Title | Date | Venue | Tickets Sold | Status | Featured | Actions
  
  Status badge: color-coded pill
  Featured: toggle switch (gold when on)
  Tickets Sold: "32 / 200" or "32 / ∞"
  Actions: Edit | View Tickets | Delete
  
Filters: All | Upcoming | Past | Cancelled

New/Edit Event Form (`app/admin/events/new/page.tsx`):
  Fields:
    Title (required)
    Description (rich textarea)
    Venue (required)
    Address
    City (required)
    Country (default: Nigeria)
    Event Date (date picker)
    Event Time (time picker)
    Is Free (toggle) → hides price if true
    Ticket Price (show if not free)
    Total Tickets (number, leave blank for unlimited)
    Ticket Types: checkboxes for General / VIP / VVIP
    VIP Price, VVIP Price (show if types selected)
    Is Featured (toggle)
    Status (select: Upcoming / Past / Cancelled)
    Poster Image (Cloudinary upload widget)
    
  [Save Event] GoldButton | [Cancel] OutlineButton
```

### Admin Gallery (`app/admin/gallery/page.tsx`)

```
Header: "Gallery" H2 + [Upload Images] GoldButton

Upload area:
  Drag-and-drop zone (dashed gold border)
  "Drag images here or click to upload"
  Accepts: jpg, png, webp, max 8MB each, multiple at once
  Upload to Cloudinary via /api/upload
  
Grid (4-col):
  Each image: thumbnail, category badge, caption
  Hover: overlay with Edit icon + Delete icon
  Edit: change caption and category (inline modal)
  Delete: confirm dialog
  
Drag to reorder (update sortOrder)
```

---

## PART 12 — AUTH (`lib/auth.ts` + NextAuth v5)

```ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.username as string }
        })
        
        if (!admin) return null
        
        const valid = await compare(credentials.password as string, admin.passwordHash)
        if (!valid) return null
        
        return { id: admin.id, name: admin.username, email: admin.email }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
})
```

Admin login page (`app/admin/login/page.tsx`):
```
Centered card on full-screen dark background
BeeJay Sax wordmark
"Admin Portal" section-label
Username + Password fields (same style as contact form)
[Sign In] GoldButton full-width
Error message if invalid
```

---

## PART 13 — EMAIL TEMPLATES (Resend)

### Ticket Confirmation Email (`lib/resend.ts`)

```ts
// sendTicketEmail(ticket: Ticket & { event: Event })
// HTML email template:
//
// Header: "BEEJAY SAX LIVE" in gold on black background
// Body:
//   "Hi {firstName},"
//   "Your ticket is confirmed!"
//   Event details table (name, date, time, venue)
//   Ticket type + number
//   QR Code image (embedded as attachment or inline base64)
//   "Present this QR code at the entrance"
//   Link to view ticket online: {siteUrl}/tickets/{qrToken}
// Footer: "Blessed & Highly Favoured. — BeeJay Sax Team"
```

### Contact Auto-Reply

```ts
// sendContactAutoReply(message: ContactMessage)
// Simple acknowledgement email
// "Thank you {name}, we've received your message..."
// Response time note: "We'll respond within 24–48 hours"
```

---

## PART 14 — NEXT.JS CONFIG (`next.config.ts`)

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
```

---

## PART 15 — SEEDING (`prisma/seed.ts`)

```ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@beejaysax.com',
      passwordHash: await hash('changeme123', 12),
    },
  })

  // Featured event (BeeJay Sax Live 2026)
  await prisma.event.create({
    data: {
      title: 'Beejay Sax Live Concert 2026',
      description: 'The annual gospel event that gathers individuals from all walks of life to enjoy ethical, Godly music in a serene atmosphere. Featuring BeeJay Sax live on saxophone and vocals.',
      venue: 'Eko Hotels and Suites',
      address: 'Plot 1415, Adetokunbo Ademola Street, Victoria Island',
      city: 'Lagos',
      country: 'Nigeria',
      eventDate: new Date('2026-05-24T17:00:00'),
      eventTime: '5:00 PM',
      isFree: false,
      ticketPrice: 5000,
      isFeatured: true,
      status: 'UPCOMING',
    },
  })

  // Sample releases
  await prisma.release.create({
    data: {
      title: 'Praise Session 1',
      slug: 'praise-session-1',
      releaseType: 'ALBUM',
      description: 'A soul-stirring collection of powerful gospel melodies, skillfully crafted to inspire and invigorate your faith.',
      isFeatured: true,
    },
  })

  await prisma.release.create({
    data: {
      title: 'Modupeoluwa',
      slug: 'modupeoluwa',
      releaseType: 'SINGLE',
      description: 'A beautiful fusion of African rhythms and soulful gospel melodies.',
    },
  })

  await prisma.release.create({
    data: {
      title: 'Joyful Praise',
      slug: 'joyful-praise',
      releaseType: 'ALBUM',
      description: 'Pure joy captured in gospel saxophone and song.',
    },
  })

  // Sample videos
  await prisma.video.createMany({
    data: [
      {
        title: 'BeeJay Sax Live in London, Indigo O2',
        youtubeId: '0jxRD456j_w',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        title: 'BeeJay Sax at House on the Rock (TAPE 2022)',
        youtubeId: 'z4saapf2BrA',
        isFeatured: true,
        sortOrder: 2,
      },
    ],
  })

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## PART 16 — README (`README.md`)

```md
# BeeJay Sax — Official Website

Built by SonsHub Media Ltd.

## Stack
- Next.js 15 + TypeScript
- Tailwind CSS v4
- Prisma + Neon PostgreSQL
- GSAP 3 + Lenis
- NextAuth.js v5
- Cloudinary (media)
- Resend (email)

## Getting Started

1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill values
4. `npx prisma db push`
5. `npx prisma db seed`
6. `npm run dev`

Admin panel: http://localhost:3000/admin
Default credentials: admin / changeme123 (CHANGE IMMEDIATELY)

## Deployment (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Add all env variables in Vercel dashboard
4. Deploy

## Migration to Webuzo VPS
See DEPLOY-VPS.md for Webuzo migration instructions.
```

---

## PART 17 — BUILD ORDER FOR CURSOR

Follow this exact sequence:

```
PHASE 1 — Foundation
  1. package.json + dependencies
  2. tailwind.config.ts
  3. next.config.ts
  4. app/globals.css
  5. lib/fonts.ts
  6. lib/prisma.ts
  7. lib/utils.ts
  8. lib/animations.ts
  9. lib/qrcode.ts
  10. prisma/schema.prisma → npx prisma db push
  11. prisma/seed.ts → npx prisma db seed

PHASE 2 — Layout & Providers
  12. components/providers/LenisProvider.tsx
  13. components/layout/CustomCursor.tsx
  14. components/layout/Navbar.tsx
  15. components/layout/Footer.tsx
  16. app/layout.tsx

PHASE 3 — UI Components
  17. components/ui/GoldButton.tsx
  18. components/ui/OutlineButton.tsx
  19. components/ui/SectionLabel.tsx
  20. components/ui/GoldRule.tsx
  21. components/ui/Marquee.tsx
  22. components/ui/StatCard.tsx
  23. components/ui/Toast.tsx

PHASE 4 — Homepage
  24. components/home/Hero.tsx
  25. components/home/AboutTeaser.tsx
  26. components/home/FeaturedRelease.tsx
  27. components/home/UpcomingEvents.tsx
  28. components/home/VideoSection.tsx
  29. components/home/GalleryStrip.tsx
  30. components/home/TestimonialsSection.tsx
  31. components/home/ContactCTA.tsx
  32. app/page.tsx

PHASE 5 — Events + Tickets
  33. components/events/EventCard.tsx
  34. components/events/TicketRegistrationForm.tsx
  35. components/tickets/QRCodeDisplay.tsx
  36. components/tickets/TicketCard.tsx
  37. app/events/page.tsx
  38. app/events/[id]/page.tsx
  39. app/tickets/[ticketId]/page.tsx
  40. app/api/tickets/purchase/route.ts
  41. app/api/tickets/[ticketId]/route.ts
  42. app/api/tickets/[ticketId]/verify/route.ts

PHASE 6 — Releases
  43. components/releases/ReleaseCard.tsx
  44. components/releases/ReleaseFilter.tsx
  45. app/releases/page.tsx
  46. app/releases/[slug]/page.tsx

PHASE 7 — Gallery
  47. components/gallery/GalleryGrid.tsx
  48. components/gallery/Lightbox.tsx
  49. app/gallery/page.tsx

PHASE 8 — Other Public Pages
  50. app/about/page.tsx
  51. app/contact/page.tsx
  52. app/api/contact/route.ts

PHASE 9 — Admin Panel
  53. lib/auth.ts
  54. app/admin/login/page.tsx
  55. components/admin/AdminSidebar.tsx
  56. components/admin/AdminHeader.tsx
  57. app/admin/layout.tsx
  58. app/admin/page.tsx (dashboard)
  59. app/admin/events/page.tsx
  60. app/admin/events/new/page.tsx
  61. app/admin/events/[id]/edit/page.tsx
  62. app/admin/events/[id]/tickets/page.tsx (QR scanner)
  63. app/admin/releases/page.tsx
  64. app/admin/releases/new/page.tsx
  65. app/admin/gallery/page.tsx
  66. app/admin/messages/page.tsx
  67. app/api/upload/route.ts (Cloudinary)
  68. lib/resend.ts → email templates

PHASE 10 — Polish & APIs
  69. app/api/events/route.ts + [id]/route.ts
  70. app/api/releases/route.ts + [id]/route.ts
  71. app/api/gallery/route.ts + [id]/route.ts
  72. SEO metadata on all pages
  73. Loading skeletons (app/loading.tsx patterns)
  74. Error boundaries (app/error.tsx)
  75. 404 page (app/not-found.tsx)
```

---

## IMPORTANT NOTES FOR CURSOR

1. **Never use `<form>` tags in React components** — use controlled state + onClick handlers
2. **All GSAP code must be in `useEffect` with `typeof window !== 'undefined'` guards**
3. **All client components that use GSAP must call `registerGSAP()` at top of useEffect**
4. **QR code generation happens server-side in the API route, not in the browser**
5. **All image uploads go through Cloudinary — never save files locally**
6. **Prisma client must use the singleton pattern from `lib/prisma.ts`**
7. **Use `next/image` for ALL images — never raw `<img>` tags**
8. **The ticket QR code encodes the URL `{SITE_URL}/tickets/{qrToken}`** — the token is the lookup key, not the Prisma ID
9. **Admin routes must check auth in both layout.tsx and individual pages** using `auth()` from NextAuth
10. **Run `npx prisma generate` after any schema changes**
11. **Tailwind classes must use the custom `bjs-*` color names defined in config, not arbitrary values**
12. **The Lenis scroll should be initialized ONCE in LenisProvider — do not initialize it again in individual components**
13. **For the grain texture on body::before — it's decorative and must have `pointer-events: none` and `z-index: 9999`**
14. **All external streaming platform links must have `target="_blank" rel="noopener noreferrer"`**

---

*Built by SonsHub Media Ltd. — sonshubmedia.com*
*Client: BeeJay Sax (Abolaji David Banjoko) — beejaysax.com*
```
