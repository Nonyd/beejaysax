import { EventCardSkeleton } from '@/components/ui/Skeleton'

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="flex h-[50vh] items-end bg-[#0F0F0F] px-8 pb-16">
        <div className="mx-auto w-full max-w-7xl space-y-4">
          <div
            style={{
              width: 120,
              height: 12,
              background: '#1A1A1A',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <div
            style={{
              width: '30%',
              height: 60,
              background: '#1A1A1A',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
