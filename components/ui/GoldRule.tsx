import { cn } from '@/lib/utils'

export default function GoldRule({ full }: { full?: boolean }) {
  return (
    <span
      className={cn('my-8 block')}
      style={{
        width: full ? '100%' : 40,
        height: 1,
        background: '#C9A84C',
      }}
    />
  )
}
