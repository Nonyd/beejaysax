import Adire from '@/components/ui/Adire'

/** Route loading state: the inner-page header shape with a pulsing title bar. */
export default function PageLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="min-h-screen bg-night">
      <div className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
        <Adire variant="field" color="#E3B23C" opacity={0.06} />
        <div className="site-shell relative pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="h-[clamp(56px,9vw,112px)] w-[min(420px,70%)] animate-pulse rounded-[16px] bg-ivory/10" />
          <div className="mt-6 h-5 w-[min(520px,85%)] animate-pulse rounded-full bg-ivory/10" />
        </div>
        <Adire variant="band" color="#E3B23C" opacity={0.6} height={32} />
      </div>
      <div className="site-shell grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[24px] bg-ivory/[0.06]" />
        ))}
      </div>
    </div>
  )
}
