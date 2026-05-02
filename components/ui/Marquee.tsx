import { cn } from '@/lib/utils'

export default function Marquee({
  text,
  direction = 'left',
  className,
  speed = 'default',
}: {
  text: string
  direction?: 'left' | 'right'
  className?: string
  speed?: 'default' | 'slow'
}) {
  const duration = speed === 'slow' ? '60s' : '50s'
  const anim =
    direction === 'left'
      ? `marquee ${duration} linear infinite`
      : `marquee ${duration} linear infinite reverse`

  const segment = (
    <span style={{ display: 'inline-flex', flexShrink: 0, alignItems: 'center' }}>
      <span
        style={{
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#333',
        }}
      >
        {text}
      </span>
      <span style={{ margin: '0 24px', color: '#C9A84C' }}>◆</span>
    </span>
  )

  return (
    <div className={cn('group w-full overflow-hidden', className)}>
      <div style={{ display: 'flex', width: 'max-content', animation: anim }}>
        {segment}
        {segment}
        {segment}
        {segment}
      </div>
    </div>
  )
}
