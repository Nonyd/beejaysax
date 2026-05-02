import { cn } from '@/lib/utils'

export default function GoldRule({ full }: { full?: boolean }) {
  return <span className={cn(full ? 'gold-rule-full' : 'gold-rule', 'my-8 block')} />
}
