import { ReleaseCardSkeleton } from '@/components/ui/Skeleton'

export default function ReleasesLoading() {
  return (
    <div className="min-h-screen bg-[#080808] pb-16 pt-32">
      <div className="mx-auto max-w-7xl px-8">
        <div style={{ width: 100, height: 12, background: '#1A1A1A', marginBottom: 16 }} />
        <div style={{ width: '25%', height: 56, background: '#1A1A1A', marginBottom: 48 }} />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ReleaseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
