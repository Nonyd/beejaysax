import type { CSSProperties } from 'react'

/** Inline typography — Tailwind v4: custom classes in globals.css are unreliable for these. */
export const displayTextStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(56px, 10vw, 130px)',
  fontWeight: 700,
  fontStyle: 'italic',
  lineHeight: 0.9,
  letterSpacing: '-0.02em',
}

export const heroDisplayLineStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(56px, 9vw, 120px)',
  fontWeight: 700,
  fontStyle: 'italic',
  lineHeight: 0.9,
  letterSpacing: '-0.02em',
}

export const h1TextStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(38px, 6vw, 88px)',
  fontWeight: 700,
  lineHeight: 0.92,
  letterSpacing: '-0.02em',
}

/** Large split headlines (Catch BeeJay Live, etc.) */
export const h1DisplaySplitStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(40px, 7vw, 96px)',
  fontWeight: 700,
  lineHeight: 0.92,
  letterSpacing: '-0.02em',
}

export const h2TextStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(28px, 4vw, 56px)',
  fontWeight: 600,
  lineHeight: 1.05,
  letterSpacing: '-0.01em',
}

export const bodyTextStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  lineHeight: 1.8,
  color: 'rgba(245, 240, 232, 0.65)',
}

export const sectionLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#C9A84C',
}

export const contactCtaHeadingStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(40px, 7vw, 88px)',
  fontWeight: 700,
  lineHeight: 0.92,
  letterSpacing: '-0.02em',
}

export const goldRuleStyle: CSSProperties = {
  width: 40,
  height: 1,
  background: '#C9A84C',
  display: 'block',
}
