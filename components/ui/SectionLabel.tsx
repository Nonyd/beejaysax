import { cn } from '@/lib/utils'
import { sectionLabelStyle } from '@/lib/typography-styles'

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
    <p className={cn(className)} style={{ ...sectionLabelStyle, ...style }}>
      {children}
    </p>
  )
}
