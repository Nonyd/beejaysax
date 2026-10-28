import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Church-window arch photo frame with an offset gold outline,
 * plus an optional slowly turning halo (the hero's one ambient motion).
 */
export default function ArchPhoto({
  src,
  alt,
  sizes,
  priority,
  halo,
  objectPosition = 'center',
  className,
}: {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  halo?: boolean
  objectPosition?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      {halo && (
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="animate-halo pointer-events-none absolute left-1/2 top-0 w-[128%] -translate-x-1/2 -translate-y-[14%]"
        >
          <circle cx="100" cy="100" r="96" fill="none" stroke="#E3B23C" strokeOpacity="0.55" strokeWidth="0.6" />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#E3B23C"
            strokeWidth="2.2"
            strokeDasharray="0.1 7.6"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#C4583A" strokeOpacity="0.6" strokeWidth="0.6" strokeDasharray="10 6" />
        </svg>
      )}
      {/* offset outline */}
      <div aria-hidden className="arch absolute inset-0 translate-x-3 translate-y-3 border-2 border-gold md:translate-x-4 md:translate-y-4" />
      <div className="arch relative aspect-[3/4] overflow-hidden bg-ink-2">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} style={{ objectFit: 'cover', objectPosition }} />
      </div>
    </div>
  )
}
