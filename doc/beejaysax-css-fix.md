# 🎷 BEEJAY SAX — CSS Fix: Typography + Layout Broken
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## PROBLEM

The public site has broken typography and layout issues:

1. Headings like "A Sound That Moves Heaven" are running together as "ASoundThatMovesHeaven" — words not separating
2. The hero text is too large and overflowing left edge
3. Custom CSS classes (display-text, h1-text, h2-text, body-text) are not applying correctly
4. The about section heading breaks awkwardly
5. General layout feels cramped and broken

The root cause: Tailwind v4 uses `@theme` and `@import` — it does NOT support custom CSS utility classes defined in `globals.css` the same way as Tailwind v3. Custom classes written in `globals.css` as plain CSS are not being picked up properly.

## THE FIX

Do NOT use custom CSS utility classes. Use inline styles or Tailwind's built-in utilities instead.

Go through EVERY component file that uses these broken classes:
- `.display-text`
- `.h1-text`  
- `.h2-text`
- `.body-text`
- `.section-label`
- `.gold-rule`

Replace them with inline styles directly on the elements.

---

## REPLACEMENT RULES

### Replace `.display-text` with this inline style:
```tsx
style={{
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(56px, 10vw, 130px)',
  fontWeight: 700,
  fontStyle: 'italic',
  lineHeight: 0.90,
  letterSpacing: '-0.02em',
}}
```

### Replace `.h1-text` with this inline style:
```tsx
style={{
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(38px, 6vw, 88px)',
  fontWeight: 700,
  lineHeight: 0.92,
  letterSpacing: '-0.02em',
}}
```

### Replace `.h2-text` with this inline style:
```tsx
style={{
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(28px, 4vw, 56px)',
  fontWeight: 600,
  lineHeight: 1.05,
  letterSpacing: '-0.01em',
}}
```

### Replace `.body-text` with this inline style:
```tsx
style={{
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  lineHeight: 1.8,
  color: 'rgba(245, 240, 232, 0.65)',
}}
```

### Replace `.section-label` with this inline style:
```tsx
style={{
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  color: '#C9A84C',
}}
```

### Replace `.gold-rule` with this:
```tsx
<div style={{ width: 40, height: 1, background: '#C9A84C' }} />
```

---

## SPECIFIC FIXES PER FILE

### `components/home/Hero.tsx`

The hero heading "BeeJav Sax." needs these fixes:

1. The container must have proper padding so text doesn't overflow:
```tsx
// Outer content container
<div style={{
  position: 'absolute',
  bottom: 80,
  left: 0,
  right: 0,
  padding: '0 48px',
  maxWidth: 900,
}}>
```

2. Each heading line must be on its own element with white-space nowrap:
```tsx
<div style={{ overflow: 'hidden' }}>
  <h1 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(56px, 9vw, 120px)',
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 0.90,
    letterSpacing: '-0.02em',
    color: '#F5F0E8',
    whiteSpace: 'nowrap',
    display: 'block',
  }}>
    BeeJay
  </h1>
</div>
<div style={{ overflow: 'hidden' }}>
  <h1 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(56px, 9vw, 120px)',
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 0.90,
    letterSpacing: '-0.02em',
    color: '#C9A84C',
    whiteSpace: 'nowrap',
    display: 'block',
  }}>
    Sax.
  </h1>
</div>
```

3. The section label above the heading:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: 24,
}}>
  GOSPEL SAXOPHONIST · MUSIC MINISTER
</p>
```

---

### `components/home/AboutTeaser.tsx`

Fix the heading "A Sound That Moves Heaven." — it must NEVER break mid-word:

```tsx
// Each line is its own element
<h2 style={{
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(28px, 4vw, 56px)',
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: '-0.01em',
  color: '#F5F0E8',
}}>
  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>A Sound That</span>
  <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Moves Heaven.</span>
</h2>
```

---

### `components/home/UpcomingEvents.tsx`

Fix the "Catch BeeJay Live." heading:

```tsx
<div>
  <h2 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 7vw, 96px)',
    fontWeight: 700,
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    color: '#F5F0E8',
    whiteSpace: 'nowrap',
  }}>
    Catch BeeJay
  </h2>
  <h2 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 7vw, 96px)',
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    color: '#C9A84C',
    whiteSpace: 'nowrap',
  }}>
    Live.
  </h2>
</div>
```

---

### `components/home/ContactCTA.tsx`

Fix the "Let's Create Something Sacred." heading:

```tsx
<div style={{ textAlign: 'center' }}>
  <h2 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 7vw, 88px)',
    fontWeight: 700,
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    color: '#F5F0E8',
    whiteSpace: 'nowrap',
  }}>
    Let&apos;s Create
  </h2>
  <h2 style={{
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 7vw, 88px)',
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 0.92,
    letterSpacing: '-0.02em',
    color: '#C9A84C',
    whiteSpace: 'nowrap',
  }}>
    Something Sacred.
  </h2>
</div>
```

---

### `components/home/TestimonialsSection.tsx`

The three testimonial cards are overlapping. Fix the grid:

```tsx
// Replace whatever grid is there with this:
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: 1,
  background: '#1E1E1E',
  border: '1px solid #1E1E1E',
  marginTop: 64,
}}>
  // On md screens: gridTemplateColumns: 'repeat(3, 1fr)'
  // Use className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1, background: '#1E1E1E' }}
```

Each card inside:
```tsx
<div style={{
  background: '#0F0F0F',
  padding: '40px 32px',
  position: 'relative',
}}>
```

---

### `app/globals.css`

Remove ALL the custom utility class definitions that are not working:
- Remove `.display-text { ... }`
- Remove `.h1-text { ... }`
- Remove `.h2-text { ... }`
- Remove `.body-text { ... }`

Keep ONLY:
- `.section-label` — but only if it's actually working. Test it.
- `.gold-rule`
- `@keyframes` definitions (shimmer, marquee, pageIn)
- The grain overlay on `body::after`
- `::selection`, `::-webkit-scrollbar` styles
- Print styles

The reason: In Tailwind v4, custom utility classes defined in CSS do not 
auto-apply via className. Use inline styles for all typography instead.

---

## ALSO FIX THESE LAYOUT ISSUES

### 1. Navbar logo spacing
The "BEEJAY SAX" wordmark at top left is too close to the edge on mobile.
Add: `paddingLeft: 24` on mobile, `paddingLeft: 48` on desktop.

### 2. Hero content padding
The hero text on mobile is overflowing the screen.
The hero content div needs:
```tsx
padding: '0 24px', // mobile
// md: padding: '0 48px'
```

### 3. Section spacing
Every major section needs consistent padding. 
Check each home component and ensure they all have:
```tsx
paddingTop: 128,    // py-32
paddingBottom: 128, // py-32
```
On mobile reduce to:
```tsx
// Use: className="py-20 md:py-32"
```

### 4. Max-width container
Every section content must be wrapped in a container:
```tsx
<div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px' }}>
  // md: padding: '0 48px'
</div>
```
Or use: `className="max-w-6xl mx-auto px-6 md:px-12"`

---

## AFTER FIXING ALL FILES

1. Run: `npm run build`
2. If build passes, run: `git add . && git commit -m "Fix typography and layout CSS" && git push`
3. Report back with:
   - Which files were changed
   - Build status
   - Any remaining issues

---

*BeeJay Sax — CSS Fix Pass*
*SonsHub Media Ltd.*
