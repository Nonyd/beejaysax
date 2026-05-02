import Link from 'next/link'

type Size = 'sm' | 'md' | 'lg'

const pad: Record<Size, string> = {
  sm: '10px 20px',
  md: '14px 28px',
  lg: '14px 32px',
}

export default function OutlineButton({
  children,
  href,
  onClick,
  className,
  size = 'md',
  type = 'button',
  disabled,
  variant = 'default',
  target,
  rel,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: Size
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'default' | 'fill'
  target?: string
  rel?: string
}) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    background: variant === 'fill' ? 'transparent' : 'transparent',
    color: variant === 'fill' ? '#C9A84C' : '#F5F0E8',
    border:
      variant === 'fill' ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(245,240,232,0.25)',
    padding: pad[size],
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }

  if (href) {
    return (
      <Link href={href} style={baseStyle} className={className} target={target} rel={rel}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={baseStyle} className={className}>
      {children}
    </button>
  )
}
