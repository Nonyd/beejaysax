import Link from 'next/link'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeClasses: Record<Size, string> = {
  sm: 'text-[11px] px-5 py-2 tracking-[0.15em]',
  md: 'text-[11px] px-7 py-3 tracking-[0.15em]',
  lg: 'text-[11px] px-7 py-3 tracking-[0.15em]',
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
  const base =
    'inline-flex items-center justify-center rounded-none bg-bjs-gold text-bjs-black font-sans font-semibold uppercase transition-all duration-200 ease-out hover:bg-bjs-gold-lt disabled:opacity-50 disabled:pointer-events-none'

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
