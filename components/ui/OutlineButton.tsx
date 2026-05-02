import Link from 'next/link'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeClasses: Record<Size, string> = {
  sm: 'text-[10px] px-5 py-2 tracking-[0.15em]',
  md: 'text-[11px] px-7 py-3 tracking-[0.15em]',
  lg: 'text-[11px] px-7 py-3 tracking-[0.15em]',
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
  /** `fill` — hover fills with gold (nav CTA). `default` — border/text gold on hover only. */
  variant?: 'default' | 'fill'
  target?: string
  rel?: string
}) {
  const base =
    variant === 'fill'
      ? 'inline-flex items-center justify-center rounded-none border border-[rgba(201,168,76,0.5)] bg-transparent font-sans font-semibold uppercase text-bjs-gold transition-all duration-200 ease-out hover:border-bjs-gold hover:bg-bjs-gold hover:text-bjs-black disabled:opacity-50 disabled:pointer-events-none'
      : 'inline-flex items-center justify-center rounded-none border border-[rgba(201,168,76,0.4)] bg-transparent font-sans font-semibold uppercase text-bjs-white transition-all duration-200 ease-out hover:border-bjs-gold hover:text-bjs-gold disabled:opacity-50 disabled:pointer-events-none'

  if (href) {
    return (
      <Link href={href} className={cn(base, sizeClasses[size], className)} target={target} rel={rel}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, sizeClasses[size], className)}>
      {children}
    </button>
  )
}
