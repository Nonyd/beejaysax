'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@prisma/client'
import { GalleryCategory } from '@prisma/client'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const FILTERS: { label: string; value: 'ALL' | GalleryCategory }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Performance', value: 'PERFORMANCE' },
  { label: 'Portrait', value: 'PORTRAIT' },
  { label: 'Events', value: 'EVENTS' },
  { label: 'Backstage', value: 'BACKSTAGE' },
]

export default function GalleryView({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<'ALL' | GalleryCategory>('ALL')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered =
    filter === 'ALL' ? images : images.filter((img) => img.category === filter)

  const openAt = useCallback((index: number) => setLightbox(index), [])
  const close = useCallback(() => setLightbox(null), [])

  const goPrev = useCallback(() => {
    setLightbox((i) => {
      if (i === null || filtered.length === 0) return i
      return (i - 1 + filtered.length) % filtered.length
    })
  }, [filtered.length])

  const goNext = useCallback(() => {
    setLightbox((i) => {
      if (i === null || filtered.length === 0) return i
      return (i + 1) % filtered.length
    })
  }, [filtered.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, close, goPrev, goNext])

  const current = lightbox !== null ? filtered[lightbox] : null

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-bjs-border bg-bjs-black">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-0 px-6 md:px-8 lg:px-12">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setFilter(f.value)
                setLightbox(null)
              }}
              className={`border-b-2 px-4 py-4 font-sans text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 md:px-6 ${
                filter === f.value
                  ? 'border-bjs-gold text-bjs-gold'
                  : 'border-transparent text-bjs-muted hover:text-bjs-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 lg:px-12">
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4 lg:gap-3">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(i)}
              className="mb-3 block w-full cursor-zoom-in break-inside-avoid overflow-hidden border-0 bg-transparent p-0 text-left"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={img.imagePath}
                  alt={img.caption ?? 'BeeJay Sax — gallery photo'}
                  width={800}
                  height={1000}
                  className="h-auto w-full object-cover transition-all duration-300 ease-out hover:scale-[1.03] hover:brightness-110"
                  sizes="25vw"
                />
              </div>
              {img.caption && <p className="mt-2 font-sans text-xs text-bjs-muted">{img.caption}</p>}
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="font-sans text-bjs-muted">No images in this category.</p>}
      </section>

      {current && lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,8,8,0.95)] backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-label="Image preview"
        >
          <button
            type="button"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center border border-bjs-border-lt text-bjs-white transition-colors hover:border-bjs-gold"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-bjs-border-lt text-bjs-white transition-colors hover:border-bjs-gold md:left-8"
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-bjs-border-lt text-bjs-white transition-colors hover:border-bjs-gold md:right-8"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center px-16">
            <div className="relative max-h-[80vh] w-full max-w-[90vw]">
              <Image
                src={current.imagePath}
                alt={current.caption ?? ''}
                width={1600}
                height={1200}
                className="max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>
            {current.caption && (
              <p className="mt-4 text-center font-sans text-[13px] text-bjs-muted">{current.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
