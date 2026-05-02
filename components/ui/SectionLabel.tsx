import { cn } from '@/lib/utils'

export default function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('section-label', className)}>{children}</p>
}
