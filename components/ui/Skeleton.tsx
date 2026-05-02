import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #111 25%, #1A1A1A 50%, #111 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function EventCardSkeleton() {
  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F]">
      <Skeleton style={{ aspectRatio: '16/9', width: '100%' }} />
      <div className="space-y-3 p-6">
        <Skeleton style={{ height: 28, width: '75%' }} />
        <Skeleton style={{ height: 16, width: '50%' }} />
        <Skeleton style={{ height: 16, width: '40%' }} />
        <Skeleton style={{ height: 40, width: '100%', marginTop: 16 }} />
      </div>
    </div>
  )
}

export function ReleaseCardSkeleton() {
  return (
    <div className="border border-[#1E1E1E] bg-[#0F0F0F]">
      <Skeleton style={{ aspectRatio: '1/1', width: '100%' }} />
      <div className="space-y-2 p-4">
        <Skeleton style={{ height: 18, width: '80%' }} />
        <Skeleton style={{ height: 14, width: '50%' }} />
        <Skeleton style={{ height: 14, width: '60%', marginTop: 8 }} />
      </div>
    </div>
  )
}

export function GalleryImageSkeleton() {
  return (
    <Skeleton style={{ width: '100%', marginBottom: 16, borderRadius: 0 }} className="break-inside-avoid" />
  )
}
