import { cn } from '@/lib/utils'

export default function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('section-label border-l-2 border-bjs-gold pl-3', className)}>
      {children}
    </p>
  )
}
