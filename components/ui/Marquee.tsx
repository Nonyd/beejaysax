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
  const animSlow = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee'
  const anim =
    direction === 'left'
      ? `${animSlow} group-hover:[animation-play-state:paused]`
      : `${animSlow} group-hover:[animation-play-state:paused] [animation-direction:reverse]`

  const segment = (
    <span className="inline-flex shrink-0 items-center">
      <span className="whitespace-nowrap font-sans text-[9px] uppercase tracking-[0.25em] text-bjs-muted">{text}</span>
      <span className="mx-6 text-bjs-gold">◆</span>
    </span>
  )

  return (
    <div className={cn('group w-full overflow-hidden', className)}>
      <div className={cn('flex w-max', anim)}>
        {segment}
        {segment}
        {segment}
      </div>
    </div>
  )
}
