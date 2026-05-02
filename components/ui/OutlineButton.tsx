import Link from 'next/link'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizeClasses: Record<Size, string> = {
  sm: 'text-[10px] px-4 py-2',
  md: 'text-[11px] px-6 py-3',
  lg: 'text-xs px-8 py-4',
}

export default function OutlineButton({
  children,
  href,
  onClick,
  className,
  size = 'md',
  type = 'button',
  disabled,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: Size
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base =
    'inline-flex items-center justify-center rounded-none bg-transparent border border-bjs-gold text-bjs-gold font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:bg-bjs-gold hover:text-bjs-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

  if (href) {
    return (
      <Link href={href} className={cn(base, sizeClasses[size], className)}>
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
