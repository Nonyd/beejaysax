import { cn } from '@/lib/utils'

/** Small gold kicker, sentence case. Use only where it tells the reader something the heading doesn't. */
export default function SectionLabel({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <p className={cn('mb-3 font-body text-sm font-medium text-gold', className)} style={style}>
      {children}
    </p>
  )
}
