import { Skeleton } from '@/components/ui/Skeleton'

export default function GalleryLoading() {
  const heights = [240, 320, 200, 360, 280, 240, 300, 200, 340, 260, 220, 300]
  return (
    <div className="min-h-screen bg-[#080808] pb-16 pt-32">
      <div className="mx-auto max-w-7xl px-8">
        <div style={{ width: 80, height: 12, background: '#1A1A1A', marginBottom: 16 }} />
        <div style={{ width: '20%', height: 56, background: '#1A1A1A', marginBottom: 48 }} />
        <div style={{ columns: 3, gap: 16 }}>
          {heights.map((h, i) => (
            <Skeleton key={i} style={{ height: h, width: '100%', marginBottom: 16, display: 'block' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
