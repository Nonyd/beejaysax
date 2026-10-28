import Link from 'next/link'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[13px]',
  md: 'px-7 py-3.5 text-[15px]',
  lg: 'px-8 py-4 text-base',
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
  /** 'fill' = gold outline; 'default' = ivory outline */
  variant?: 'default' | 'fill'
  target?: string
  rel?: string
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border bg-transparent font-body font-semibold no-underline transition-colors duration-200',
    variant === 'fill'
      ? 'border-gold text-gold hover:bg-gold hover:text-night'
      : 'border-ivory/40 text-ivory hover:border-gold hover:text-gold',
    disabled && 'cursor-not-allowed opacity-50',
    sizes[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}
