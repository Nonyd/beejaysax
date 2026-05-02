import { cn } from '@/lib/utils'

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
    <p
      className={cn(className)}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#C9A84C',
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </p>
  )
}
