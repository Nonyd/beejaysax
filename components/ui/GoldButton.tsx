import Link from 'next/link'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[13px]',
  md: 'px-7 py-3.5 text-[15px]',
  lg: 'px-8 py-4 text-base',
}

export default function GoldButton({
  children,
  href,
  onClick,
  className,
  size = 'md',
  type = 'button',
  disabled,
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
  target?: string
  rel?: string
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-gold font-body font-semibold text-night no-underline transition-colors duration-200 hover:bg-gold-lt',
    disabled && 'cursor-not-allowed opacity-50 hover:bg-gold',
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
