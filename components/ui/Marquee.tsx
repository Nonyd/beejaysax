import { cn } from '@/lib/utils'

export default function Marquee({
  text,
  direction = 'left',
  className,
}: {
  text: string
  direction?: 'left' | 'right'
  className?: string
}) {
  const anim =
    direction === 'left'
      ? 'animate-marquee group-hover:[animation-play-state:paused]'
      : 'animate-marquee group-hover:[animation-play-state:paused] [animation-direction:reverse]'

  const segment = (
    <span className="inline-flex shrink-0 items-center">
      <span className="whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.2em] text-bjs-muted">
        {text}
      </span>
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
