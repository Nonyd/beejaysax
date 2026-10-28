'use client'

import { cn } from '@/lib/utils'

export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; value: T; count?: number }[]
  value: T
  onChange: (v: T) => void
  /** Accessible name for the group, e.g. "Filter releases" */
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              'rounded-full border px-5 py-2.5 font-body text-sm font-semibold transition-colors',
              active ? 'border-gold bg-gold text-night' : 'border-line text-ivory/80 hover:border-gold hover:text-gold'
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn('ml-2 font-medium', active ? 'text-night/60' : 'text-ivory/45')}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
