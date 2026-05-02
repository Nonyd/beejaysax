import { cn } from '@/lib/utils'
import { goldRuleStyle } from '@/lib/typography-styles'

export default function GoldRule({ full }: { full?: boolean }) {
  return (
    <span
      className={cn('my-8 block')}
      style={{
        ...goldRuleStyle,
        width: full ? '100%' : goldRuleStyle.width,
      }}
    />
  )
}
