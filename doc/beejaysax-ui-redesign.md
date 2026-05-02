# 🎷 BEEJAY SAX — Complete UI/UX Redesign
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## CONTEXT

The BeeJay Sax website is fully built and deployed on Vercel. All features work correctly:
- Ticket purchase + QR system
- Admin panel
- Events, releases, gallery, contact

The client wants a complete visual redesign — sleeker, more premium, more refined.
Keep ALL features and data exactly as they are.
Only redesign the visual layer: layouts, typography, spacing, components, animations.

DO NOT touch:
- Any API routes
- Any database logic
- Prisma schema
- Auth logic
- Admin panel (admin stays as is)
- Any file in /app/api/
- Any file in /lib/
- prisma/schema.prisma

ONLY redesign these files:
- app/globals.css
- app/(site)/layout.tsx
- All components in components/home/
- All components in components/ui/
- All components in components/layout/ (Navbar, Footer)
- All components in components/events/
- All components in components/releases/
- All components in components/gallery/
- All page.tsx files in app/(site)/

BUILD EVERYTHING IN ONE GO. Do not stop between files.

---

## NEW DESIGN DIRECTION

### The Concept: "Sacred Stage"
Think: a world-class gospel artist who sells out the O2 London.
The site should feel like a premium editorial music platform crossed with a luxury brand.
Reference feel: Apple Music meets a high-end fashion editorial.

### The Three Rules
1. **Breathe** — massive whitespace, nothing crowded, every element has room
2. **Command** — typography is the hero, oversized and intentional
3. **Glow** — gold is used sparingly but powerfully, like candlelight in darkness

### What changes from the current design
- Remove ALL layout overlaps and broken grid issues
- Fix ALL text overflow and word-break problems
- Make every section full-width with proper contained max-width content
- Replace cluttered sections with clean, editorial layouts
- Make mobile look as good as desktop
- Add micro-interactions that feel premium not gimmicky

---

## DESIGN SYSTEM

### Colors (keep existing Tailwind config, just use them better)
```
Background:    #080808  (deep black)
Surface:       #0F0F0F  (card backgrounds)
Surface 2:     #141414  (elevated surfaces)
Border:        #1E1E1E  (subtle borders)
Border light:  #2A2A2A  (visible borders)
White:         #F5F0E8  (warm parchment white)
White dim:     rgba(245,240,232,0.5)
Gold:          #C9A84C  (primary accent)
Gold light:    #E8C96D  (hover state)
Gold dim:      rgba(201,168,76,0.08) (subtle tint)
Muted:         #4A4A4A  (secondary text)
```

### Typography (keep existing fonts — Playfair Display + DM Sans)
```
/* Display — hero headings */
font-size: clamp(56px, 10vw, 140px);
font-family: Playfair Display;
font-weight: 700;
font-style: italic;
line-height: 0.90;
letter-spacing: -0.02em;

/* H1 — page headings */  
font-size: clamp(40px, 7vw, 96px);
font-family: Playfair Display;
font-weight: 700;
line-height: 0.92;
letter-spacing: -0.02em;

/* H2 — section headings */
font-size: clamp(32px, 5vw, 64px);
font-family: Playfair Display;
font-weight: 600;
line-height: 1.0;

/* Section Label */
font-size: 10px;
font-family: DM Sans;
font-weight: 500;
letter-spacing: 0.3em;
text-transform: uppercase;
color: #C9A84C;

/* Body */
font-size: 15px;
line-height: 1.8;
font-family: DM Sans;
color: rgba(245,240,232,0.65);

/* Caption */
font-size: 12px;
line-height: 1.6;
font-family: DM Sans;
color: #4A4A4A;
```

### Spacing System
```
Section padding: py-24 md:py-32 lg:py-40
Container:       max-w-6xl mx-auto px-6 md:px-8 lg:px-12
Card padding:    p-6 md:p-8
Gap between cards: gap-4 md:gap-6
```

### Component Patterns

**Gold Rule:** `<div style="width:40px;height:1px;background:#C9A84C" />`

**Section Label pattern:**
```
<p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;margin-bottom:16px">
  THE LABEL
</p>
```

**Card pattern:**
```
background: #0F0F0F
border: 1px solid #1E1E1E
hover: border-color: #C9A84C, transform: translateY(-2px)
transition: all 300ms ease
```

**Button — Gold filled:**
```
background: #C9A84C
color: #080808
padding: 12px 28px
font-size: 11px
font-weight: 600
letter-spacing: 0.15em
text-transform: uppercase
hover: background: #E8C96D
transition: 200ms
no border-radius (sharp edges)
```

**Button — Outline:**
```
background: transparent
border: 1px solid rgba(201,168,76,0.4)
color: #F5F0E8
same padding/font as above
hover: border-color: #C9A84C, color: #C9A84C
```

---

## FILE-BY-FILE REDESIGN SPECS

---

### `app/globals.css`

Replace completely with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --gold: #C9A84C;
  --gold-lt: #E8C96D;
  --black: #080808;
  --white: #F5F0E8;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: #080808;
  color: #F5F0E8;
  scroll-behavior: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  background: #080808;
  overflow-x: hidden;
}

/* Grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.018;
  pointer-events: none;
  z-index: 9999;
}

::selection { background: #C9A84C; color: #080808; }

::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-track { background: #080808; }
::-webkit-scrollbar-thumb { background: #C9A84C; }

:focus-visible { outline: 1px solid #C9A84C; outline-offset: 4px; }

/* Typography utilities */
.display-text {
  font-family: var(--font-serif);
  font-size: clamp(56px, 10vw, 140px);
  font-weight: 700;
  font-style: italic;
  line-height: 0.90;
  letter-spacing: -0.02em;
}

.h1-text {
  font-family: var(--font-serif);
  font-size: clamp(40px, 7vw, 96px);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.02em;
}

.h2-text {
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 56px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.section-label {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #C9A84C;
}

.gold-rule {
  width: 40px;
  height: 1px;
  background: #C9A84C;
  display: block;
}

.body-text {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.8;
  color: rgba(245, 240, 232, 0.65);
}

/* Page fade in */
@keyframes pageIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-enter { animation: pageIn 0.5s ease both; }

/* Shimmer for skeletons */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Marquee */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.333%); }
}

/* Print */
@media print {
  .no-print { display: none !important; }
  nav, footer { display: none !important; }
  body { background: white; color: black; }
}

* { -webkit-tap-highlight-color: rgba(201,168,76,0.1); }
```

---

### `components/layout/Navbar.tsx`

Redesign completely. Keep all existing logic (scroll detection, mobile menu, auth).

**Design:**
```
Fixed top, z-50, w-full
Default state: transparent, no border
Scrolled state (>60px): 
  background: rgba(8,8,8,0.92)
  backdrop-filter: blur(20px) saturate(180%)
  border-bottom: 1px solid #1E1E1E

Height: 64px

LEFT: Logo
  "BEEJAY" — DM Sans, 11px, weight 700, tracking-[0.2em], uppercase, #F5F0E8
  " SAX" — Playfair Display, 13px, italic, #C9A84C
  No image logo needed — wordmark only

CENTER (desktop ≥1024px):
  Links: Home · Releases · Events · Gallery · About · Contact
  Font: DM Sans, 10px, weight 500, tracking-[0.2em], uppercase
  Color: rgba(245,240,232,0.5)
  Hover: #F5F0E8
  Active: #C9A84C
  Transition: color 200ms

RIGHT:
  "Book BeeJay" button
  border: 1px solid rgba(201,168,76,0.5)
  color: #C9A84C
  padding: 8px 20px
  font: DM Sans 10px, weight 600, tracking-[0.15em], uppercase
  hover: background #C9A84C, color #080808
  transition: all 200ms

MOBILE MENU (<1024px):
  Hamburger: 3 lines, each 20px wide 1.5px tall, #F5F0E8, gap 5px
  Animates to X on open
  
  Full screen overlay:
    background: #080808
    z-index: 100
    
  Links stacked center:
    Font: Playfair Display, clamp(36px,8vw,56px), italic
    Color: rgba(245,240,232,0.5)
    hover/active: #F5F0E8
    Each link separated by 1px gold line
    Stagger in with CSS animation-delay
    
  Bottom: Book BeeJay gold button + social icons row
```

---

### `components/layout/Footer.tsx`

```
bg-[#080808]
border-top: 1px solid #1E1E1E
padding: 80px 0 40px

SECTION 1 (text-center pb-16 border-b border-[#1E1E1E]):
  Large wordmark:
    "BEEJAY" — DM Sans 13px weight 700 tracking-[0.3em] uppercase #F5F0E8
    " SAX" — Playfair Display italic 14px #C9A84C
    (Make it larger here — this is the footer centerpiece)
  
  Below: italic Playfair Display 18px #C9A84C opacity-60
  "Blessed & Highly Favoured."
  
  Social icons row (mt-8):
    Instagram, YouTube, Facebook, Spotify, TikTok
    Each: 32px circle border border-[#1E1E1E] flex items-center justify-center
    Icon: 14px, color: #4A4A4A
    Hover: border-[#C9A84C] color: #C9A84C
    transition 200ms

SECTION 2 (py-8 flex justify-between items-center flex-wrap gap-4):
  Left: nav links in a row, 10px DM Sans uppercase tracking-wide
         color: #4A4A4A, hover: #F5F0E8
  
  Right: "© 2025 BeeJay Sax" left · "Built by SonsHub Media" right
         10px DM Sans, color: #2A2A2A
         "SonsHub Media" hover: #C9A84C
```

---

### `components/home/Hero.tsx`

Complete redesign. Keep all GSAP animations and data fetching.

```
'use client'
height: 100svh
position: relative
overflow: hidden

BACKGROUND:
  next/image fill, objectFit cover, objectPosition: center
  priority: true
  
  Gradient overlay (3 layers):
    layer 1: linear-gradient(to right, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 100%)
    layer 2: linear-gradient(to bottom, transparent 40%, rgba(8,8,8,0.9) 80%, #080808 100%)
    layer 3: radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)

CONTENT (absolute inset-0, flex flex-col justify-end pb-20 px-6 md:px-12 lg:px-16):
  max-w-5xl (left-aligned, not centered)
  
  Section label (mb-6):
    "GOSPEL SAXOPHONIST · MUSIC MINISTER"
  
  Display heading (two lines):
    Line 1: "BeeJay" — display-text class, color: #F5F0E8
    Line 2: "Sax." — display-text class, color: #C9A84C
    Each line wrapped in overflow-hidden div for reveal animation
  
  Tagline (mt-6):
    "Blessed & Highly Favoured."
    Playfair Display italic 18px, color: rgba(245,240,232,0.5)
  
  CTA row (mt-10 flex gap-4 flex-wrap):
    [Upcoming Events] → gold filled button → /events
    [Listen Now] → outline button → /releases
  
  BOTTOM LEFT: Scroll indicator
    position: absolute bottom-8 left-6 md:left-12
    flex items-center gap-3
    "SCROLL" — section-label
    Thin gold line 40px animated width pulse

BOTTOM: Full-width marquee ticker
  position: absolute bottom-0 left-0 right-0
  height: 36px
  background: rgba(8,8,8,0.6)
  backdrop-filter: blur(10px)
  border-top: 1px solid #1E1E1E
  
  Marquee text:
  "BLESSED & HIGHLY FAVOURED · GOSPEL SAXOPHONIST · MUSIC MINISTER · 
   BEEJAY SAX LIVE CONCERT · SPIRIT-FILLED SOUND · NIGERIA'S FINEST ·"
  Font: DM Sans 9px, tracking-[0.25em], uppercase, color: #4A4A4A
  Gold ◆ separator between items

GSAP animations (useEffect):
  - Heading lines: each char from y:100% opacity:0 stagger:0.03
  - Section label: y:20 opacity:0 → 0 delay:0.1
  - Tagline: opacity:0 → 1 delay:0.8
  - CTAs: y:20 opacity:0 → 0 stagger:0.1 delay:1.0
  - Scroll indicator: opacity:0 → 1 delay:1.4
```

---

### `components/home/AboutTeaser.tsx`

```
'use client'
bg: #080808
padding: py-32 md:py-40

LAYOUT: max-w-6xl mx-auto px-6 md:px-12
  grid: grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center

LEFT (image):
  Aspect ratio: 3/4
  next/image objectFit cover
  No border-radius
  Left gold accent: absolute left-0 top-0 bottom-0 w-[2px] bg-[#C9A84C]
  Wrap in: relative overflow-hidden
  Hover: image scale 1.04 transition 800ms ease

RIGHT (text):
  Section label: "THE ARTIST"
  
  Heading (mt-4):
    Line 1: "A Sound That"
    Line 2: "Moves Heaven."
    h2-text class
    IMPORTANT: Each word in a <span style="white-space:nowrap">
    So heading NEVER breaks mid-word
  
  Gold rule (mt-6 mb-6)
  
  Body text (body-text class, max-w-md):
    "Abolaji David Banjoko — known to the world as BeeJay Sax — is one of 
    Nigeria's most distinctive gospel saxophonists. His spirit-filled tone 
    doesn't just fill rooms; it moves hearts."
    
    "A Mechanical Engineering graduate who traded blueprints for ministry, 
    BeeJay has graced the stages of The Experience and Night of Worship 
    alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene."
  
  Stats row (mt-10):
    3 stats side by side, separated by 1px vertical gold lines
    
    Each stat:
      Number: Playfair Display clamp(40px,5vw,64px) #C9A84C font-weight 700
      Label: DM Sans 10px uppercase tracking-[0.2em] #4A4A4A mt-1
    
    Values: 2 Albums · 20+ Years · 3 Continents
    
    IMPORTANT: Wrap stat numbers in countUp animation via GSAP
  
  Link (mt-8):
    "Full Story" + arrow →
    DM Sans 12px uppercase tracking-[0.15em] #C9A84C
    Arrow slides right 4px on hover
    → /about

GSAP ScrollTrigger:
  Image: x:-40 opacity:0 → 0 on enter
  Text block: x:40 opacity:0 → 0 on enter, delay 0.1
```

---

### `components/home/FeaturedRelease.tsx`

```
'use client'
bg: #0F0F0F
border-top: 1px solid #1E1E1E
border-bottom: 1px solid #1E1E1E
padding: py-32 md:py-40

If no featured release: return null

LAYOUT: max-w-6xl mx-auto px-6 md:px-12
  Section label: "LATEST RELEASE"
  
  grid: grid-cols-1 lg:grid-cols-5 gap-0 mt-12
  
  LEFT (col-span-2):
    Cover image: aspect-square
    next/image objectFit cover
    No border-radius
    Hover: scale 1.03 transition 600ms
    Wrap in overflow-hidden
    
  RIGHT (col-span-3 px-0 lg:px-14 py-8 lg:py-0 flex flex-col justify-center):
    Release type badge:
      border: 1px solid rgba(201,168,76,0.3)
      color: #C9A84C
      padding: 4px 12px
      font: DM Sans 9px uppercase tracking-[0.2em]
      display: inline-block
      width: fit-content
    
    Title (mt-4): h2-text class, color: #F5F0E8
    Gold rule (mt-5 mb-5)
    Description: body-text max 3 lines
    
    Streaming row (mt-8):
      Label: "Stream Now" section-label mb-3
      
      Platforms as icon+name pill buttons:
        Each: flex items-center gap-2 px-4 py-2.5
               border: 1px solid #1E1E1E
               hover: border-[#C9A84C] bg-[#C9A84C]/5
               transition 200ms
               text: DM Sans 11px #F5F0E8
        
        Show only platforms that have URLs (hide if null)
        Platforms: Spotify · Apple Music · Audiomack · YouTube · Boomplay
    
    Link (mt-6):
      "More About This Release →" — same style as about link
      → /releases/[slug]
```

---

### `components/home/UpcomingEvents.tsx`

```
'use client'
bg: #080808
padding: py-32 md:py-40

LAYOUT: max-w-6xl mx-auto px-6 md:px-12

Header row (flex justify-between items-end mb-16):
  Left:
    Section label: "ON STAGE"
    Heading (mt-3): 
      "Catch BeeJay" — h1-text, color: #F5F0E8
      "Live." — h1-text, color: #C9A84C, font-style: italic
      IMPORTANT: Keep on separate lines, never wrap mid-word
      Use: white-space: nowrap on each line
  
  Right (desktop only):
    "View All Events →" outline button → /events

Events:
  If events exist:
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5
    Each: <EventCard event={event} />
  
  If no events:
    text-center py-20
    Gold saxophone emoji large (opacity-20)
    "No upcoming events." — h2-text opacity-30
    "New dates coming soon." — body-text
    [Get Notified] → /contact

Mobile CTA (below grid, md:hidden mt-8 text-center):
  [View All Events →] outline button
```

---

### `components/events/EventCard.tsx`

Complete redesign:

```
Props: { event: Event }

Container:
  bg: #0F0F0F
  border: 1px solid #1E1E1E
  hover: border-color #C9A84C, translateY(-3px)
  transition: all 350ms ease
  cursor: pointer → /events/[id]
  overflow: hidden
  position: relative

IMAGE AREA (aspect-video, relative overflow-hidden):
  If posterImage:
    next/image fill objectFit cover
    hover: scale 1.05 transition 600ms
  Else:
    bg: linear-gradient(135deg, #0F0F0F 0%, #161616 100%)
    Center: gold music note SVG (opacity 15%, size 48px)
  
  STATUS BADGE (absolute top-3 right-3):
    UPCOMING: bg #C9A84C text-[#080808]
    PAST: bg #1E1E1E text-[#4A4A4A]
    CANCELLED: bg rgba(127,29,29,0.8) text-red-300
    Font: DM Sans 9px uppercase tracking-[0.15em] px-2.5 py-1

DATE BADGE (absolute bottom-0 left-0):
  bg: rgba(8,8,8,0.9)
  backdrop-filter: blur(10px)
  padding: 10px 16px
  border-right: 1px solid #1E1E1E
  border-top: 1px solid #1E1E1E
  
  Day: Playfair Display 36px #C9A84C font-weight 700 line-height 1
  Month: DM Sans 9px uppercase tracking-[0.15em] #4A4A4A mt-0.5

BODY (p-5):
  Title: Playfair Display 18px #F5F0E8 font-weight 600 line-height 1.3
         LIMIT: 2 lines max (line-clamp-2)
  
  Venue + City (mt-2):
    DM Sans 12px #4A4A4A
    One line: "Eko Hotels and Suites · Lagos"
  
  Time (mt-1): DM Sans 11px #2A2A2A if available

FOOTER (px-5 pb-5 flex justify-between items-center):
  border-top: 1px solid #141414 pt-4 mt-4
  
  Price:
    FREE: "FREE" — DM Sans 11px #C9A84C uppercase tracking-wide
    Paid: "₦{price.toLocaleString()}" — Playfair Display 18px #C9A84C
  
  Button:
    "Get Tickets" or "View Event"
    border: 1px solid rgba(201,168,76,0.3)
    color: #C9A84C
    padding: 6px 14px
    font: DM Sans 10px uppercase tracking-[0.12em]
    hover: bg #C9A84C color #080808
    transition: 200ms
```

---

### `components/home/VideoSection.tsx`

```
'use client'
bg: #0F0F0F
border-top: 1px solid #1E1E1E
border-bottom: 1px solid #1E1E1E
padding: py-32 md:py-40

LAYOUT: max-w-6xl mx-auto px-6 md:px-12

Section label: "WATCH"
Heading (mt-3):
  "Experience The" — h2-text
  "Performance." — h2-text color: #C9A84C

Featured video (mt-12):
  aspect-video w-full bg-[#080808] relative overflow-hidden
  
  YouTube iframe (hidden until play clicked)
  
  Thumbnail overlay (shown by default):
    YouTube thumbnail as background image
    Dark overlay rgba(8,8,8,0.5)
    
    Center: Play button
      60px circle
      bg: #C9A84C
      color: #080808
      triangle play icon (CSS or SVG)
      hover: scale 1.1 bg #E8C96D
      transition 200ms
    
    Bottom-left: video title
      DM Sans 13px #F5F0E8 px-6 py-4
      absolute bottom-0 left-0 right-0
      background: linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 100%)
  
  On click: remove overlay, show iframe with autoplay=1

Secondary videos (mt-4 grid grid-cols-2 gap-4):
  Smaller version — same play button treatment
  aspect-video
  Smaller play button: 40px

[View All Videos] (mt-8 text-center):
  Outline button → YouTube channel URL
```

---

### `components/home/GalleryStrip.tsx`

```
'use client'
bg: #080808
padding: py-20

overflow: hidden

Section label centered: "MOMENTS"

Two rows (mt-8, space-y-3):
  Row 1: scroll left — animation: marquee 50s linear infinite
  Row 2: scroll right — animation: marquee 40s linear infinite reverse
  
  Each row: flex gap-3 (no wrap)
  Images duplicated 3x for seamless loop
  
  Each image:
    width: 260px
    height: 180px
    flex-shrink: 0
    overflow: hidden
    
    next/image objectFit cover
    hover: scale 1.05 brightness(1.1) transition 400ms
    cursor: pointer → /gallery

Pause both rows on hover:
  Wrap in div with group class
  On group-hover: animation-play-state paused

[View Full Gallery] (mt-10 text-center):
  Outline button → /gallery
```

---

### `components/home/TestimonialsSection.tsx`

Complete redesign — fix the overlapping issue:

```
'use client'
bg: #0F0F0F
border-top: 1px solid #1E1E1E
padding: py-32 md:py-40

LAYOUT: max-w-6xl mx-auto px-6 md:px-12

Section label: "THEY SAY"
Heading (mt-3): "The Sound Speaks" — h2-text

Cards grid (mt-16):
  display: grid
  grid-template-columns: repeat(1, 1fr) → md: repeat(3, 1fr)
  gap: 1px (gap between cards is just the border showing through)
  background: #1E1E1E (the gap color)
  border: 1px solid #1E1E1E
  
  Each card:
    background: #0F0F0F
    padding: 40px 32px
    position: relative
    
    Quote mark:
      position: absolute
      top: 24px right: 24px
      font: Playfair Display 80px
      color: rgba(201,168,76,0.06)
      line-height: 1
      user-select: none
      pointer-events: none
    
    Quote text:
      Playfair Display italic 17px line-height 1.7 color: rgba(245,240,232,0.8)
    
    Attribution (mt-6):
      1px gold rule mb-4 (width 24px)
      Name: DM Sans 10px uppercase tracking-[0.2em] #C9A84C
      Role: DM Sans 10px #4A4A4A mt-1

Hardcoded quotes:
  1. "BeeJay Sax carries a rare gift — when he plays, heaven draws near."
     — Pastor · Night of Worship
  
  2. "One of the most spirit-led saxophonists we've hosted at The Experience."
     — Event Organiser · The Experience
  
  3. "His Online Praise Party became our family's weekly sanctuary during lockdown."
     — Audience Member · United Kingdom

GSAP: Cards stagger from y:30 opacity:0 on scroll
```

---

### `components/home/ContactCTA.tsx`

```
bg: #080808
border-top: 1px solid #1E1E1E
padding: py-32 md:py-40

LAYOUT: max-w-4xl mx-auto px-6 md:px-12 text-center

Section label: "GET IN TOUCH"

Heading (mt-4):
  "Let's Create" — h1-text color: #F5F0E8
  "Something Sacred." — h1-text color: #C9A84C italic
  Keep each line on its own line — white-space: nowrap

Gold rule centered (mt-8 mb-8 mx-auto)

Body (body-text max-w-lg mx-auto):
  "Available for concerts, corporate events, gospel conferences, 
  and collaborations — within Nigeria and internationally."

Buttons row (mt-10 flex flex-wrap gap-4 justify-center):
  [Book BeeJay] → GoldButton → /contact?inquiry=booking
  [Send a Message] → OutlineButton → /contact

Contact info (mt-12 flex flex-wrap gap-8 justify-center):
  📍 Lagos, Nigeria
  📞 +234 80 5898 2828
  Each: flex items-center gap-2
        DM Sans 13px color: #4A4A4A
        Icon: color #C9A84C

Bottom marquee (mt-16):
  Same as hero ticker but slower (60s)
  opacity: 0.4
```

---

### `app/(site)/events/page.tsx`

```
PAGE HEADER (h-[45vh] min-h-[360px] relative overflow-hidden):
  Background: dark gradient or image
  bg: linear-gradient(135deg, #080808 0%, #0F0F0F 50%, #080808 100%)
  
  Radial glow: radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)
  
  Content (absolute bottom-12 left-0 right-0 max-w-6xl mx-auto px-6 md:px-12):
    Section label: "EVENTS"
    H1 (mt-3): "On Stage." — h1-text

TAB TOGGLE (bg-[#080808] border-b border-[#1E1E1E] sticky top-[64px] z-30):
  max-w-6xl mx-auto px-6 md:px-12
  flex gap-0
  
  Each tab:
    padding: 16px 24px
    font: DM Sans 10px uppercase tracking-[0.2em]
    color: #4A4A4A (inactive)
    border-bottom: 2px solid transparent (inactive)
    
    Active:
      color: #C9A84C
      border-bottom: 2px solid #C9A84C
    
    Hover: color #F5F0E8

EVENTS GRID (max-w-6xl mx-auto px-6 md:px-12 py-16):
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5

PAST events:
  Same grid but cards have opacity-60
  "PAST" overlay badge on image
```

---

### `app/(site)/gallery/page.tsx`

```
PAGE HEADER: Same style as events page
  Section label: "GALLERY"
  H1: "Moments." — h1-text

FILTER TABS (same sticky tab style):
  All · Performance · Portrait · Events · Backstage

MASONRY GRID (max-w-6xl mx-auto px-6 md:px-12 py-16):
  columns: 2 (mobile) → 3 (md) → 4 (lg)
  gap: 12px
  
  Each image:
    break-inside-avoid
    mb-3
    overflow: hidden
    cursor: zoom-in
    
    next/image with natural aspect ratio
    hover: scale 1.03 brightness(1.1) transition 400ms
    
    On click: open lightbox

LIGHTBOX:
  fixed inset-0 z-50
  bg: rgba(8,8,8,0.95) backdrop-blur-sm
  
  Center: image (max-h-[85vh] max-w-[90vw] object-contain)
  
  Navigation:
    Left/right arrows: 44px circles border border-[#2A2A2A]
    hover: border-[#C9A84C]
    
  Caption: bottom center, DM Sans 13px #4A4A4A
  Close: X top-right, same circle button
  Keyboard: Escape, ← →
```

---

### `app/(site)/releases/page.tsx`

```
PAGE HEADER: Same style
  Section label: "DISCOGRAPHY"
  H1: "The Music." — h1-text

FILTER TABS:
  All · Singles · Albums · EPs

RELEASES GRID (max-w-6xl mx-auto px-6 md:px-12 py-16):
  grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
  
  Each card (ReleaseCard):
    No border-radius anywhere
    Cover image aspect-square overflow-hidden
    Image hover: scale 1.06 transition 500ms
    
    Type badge: absolute top-2 left-2
      bg rgba(8,8,8,0.85) backdrop-blur-sm
      border: 1px solid rgba(201,168,76,0.3)
      color: #C9A84C
      DM Sans 9px uppercase tracking-[0.1em] px-2 py-1
    
    Body (p-4):
      Title: Playfair Display 16px #F5F0E8 font-weight 500 mt-1 line-clamp-1
      Year: DM Sans 11px #4A4A4A mt-1
      
      Streaming icons row (mt-3):
        Show only platforms with URLs
        Each icon: 16px, color #2A2A2A, hover #C9A84C, transition 200ms
    
    Bottom: "More Info →" DM Sans 10px #C9A84C uppercase tracking-wide mt-2
```

---

### `app/(site)/about/page.tsx`

```
HERO (h-[60vh] relative overflow-hidden):
  Split: left half dark, right half portrait image
  
  Left content (max-w-6xl mx-auto absolute inset-0 flex items-end pb-16 px-6 md:px-12):
    Section label: "THE ARTIST"
    H1 (mt-3):
      "Abolaji David" — h1-text
      "Banjoko." — h1-text color:#C9A84C

THE STORY section:
  max-w-6xl mx-auto px-6 md:px-12 py-24
  grid grid-cols-1 lg:grid-cols-3 gap-16
  
  Left col (col-span-1):
    Section label: "THE ORIGIN"
    Large year: Playfair Display 96px italic #C9A84C/10
    "Since 2000" in front: Playfair Display 14px #C9A84C
  
  Right col (col-span-2 space-y-6):
    Full bio paragraphs in body-text style

NOTABLE PERFORMANCES:
  bg: #0F0F0F border-y border-[#1E1E1E]
  py-24 max-w-6xl mx-auto px-6 md:px-12
  
  Section label + heading: "Shared The Stage With"
  
  Name ticker (Marquee component, large):
    Playfair Display italic clamp(24px,4vw,40px) color: rgba(245,240,232,0.15)
    Content: "DONNIE McCLURKIN · NATHANIEL BASSEY · TRAVIS GREENE · "
  
  Events grid (mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4):
    Each card: venue/event, year, description
    Same card pattern as above
```

---

### `app/(site)/contact/page.tsx`

```
max-w-6xl mx-auto px-6 md:px-12 py-32

GRID: grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24

LEFT:
  Section label: "REACH OUT"
  H1 (mt-3): "Let's Talk." — h1-text
  Gold rule (mt-6 mb-8)
  
  Contact items (space-y-5):
    Each: flex items-center gap-4
      Icon circle: 36px border border-[#1E1E1E] flex-center
                   icon: 14px #C9A84C
      Text: DM Sans 14px #F5F0E8
  
  Items:
    📍 Lagos, Nigeria
    📞 +234 80 5898 2828
    ✉️ booking@beejaysax.com
  
  Social links (mt-10 flex gap-3):
    Each: 40px circle border border-[#1E1E1E]
    Icon: 16px #4A4A4A hover:#C9A84C
  
  Note box (mt-12):
    border-left: 2px solid #C9A84C
    padding: 16px 20px
    bg: rgba(201,168,76,0.03)
    DM Sans 13px color: rgba(245,240,232,0.5) line-height 1.7
    "For international bookings, include your country, 
    event type, and preferred dates."

RIGHT (contact form):
  Form fields (space-y-5):
    First + Last name: grid grid-cols-2 gap-4
    Email, Phone, Inquiry Type, Subject, Message
    
    ALL inputs:
      width: 100%
      background: #0F0F0F
      border: 1px solid #1E1E1E
      padding: 14px 16px
      color: #F5F0E8
      font: DM Sans 14px
      NO border-radius
      focus: border-color #C9A84C outline none
      transition: border-color 200ms
      placeholder: color #2A2A2A
    
    Label style (above each input):
      DM Sans 10px uppercase tracking-[0.2em] #C9A84C mb-2 block
    
    Textarea: min-height 160px resize-none
    
    Select: same style as input
    
  [Send Message] → GoldButton full-width mt-2
  
  Success/error toast (top-right, existing toast component)
```

---

## FINAL INSTRUCTIONS

After completing all files:

1. Run: `npm run build`
2. Fix any TypeScript errors — do not change logic, only fix type issues
3. Run: `git add . && git commit -m "UI redesign — sleek editorial" && git push`
4. Report:
   - Build status
   - List of files changed
   - Any issues found

### Critical rules for this redesign:
- NO border-radius anywhere on the site (sharp edges throughout)
- NO text that overflows its container or breaks mid-word
- Every heading must use `white-space: nowrap` or be in a container wide enough
- Every image must be in an `overflow-hidden` container
- Mobile must look as good as desktop — test every section at 375px width
- Gold is used SPARINGLY — only for accents, never as background on large areas
- All transitions must be smooth — use `transition: all 300ms ease` minimum

---

*BeeJay Sax UI Redesign — SonsHub Media Ltd.*
