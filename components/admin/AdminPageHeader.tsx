import type { CSSProperties } from 'react'

export default function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      style={{ borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', paddingBottom: 28 }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: 10,
            }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(26px,3.2vw,36px)',
            fontWeight: 600,
            color: 'var(--ivory)',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.5,
              color: 'color-mix(in srgb, var(--ivory) 65%, transparent)',
              marginTop: 10,
              marginBottom: 0,
              maxWidth: 560,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
    </div>
  )
}

/** Primary CTA link styled like the public site gold buttons */
export function adminPrimaryLinkStyle(): CSSProperties {
  return {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    background: 'var(--gold)',
    color: 'var(--night)',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid color-mix(in srgb, var(--gold) 50%, transparent)',
    transition: 'background 200ms',
  }
}

export function adminOutlineLinkStyle(): CSSProperties {
  return {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ivory)',
    background: 'transparent',
    border: '1px solid color-mix(in srgb, var(--ivory) 20%, transparent)',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 200ms, color 200ms',
  }
}
