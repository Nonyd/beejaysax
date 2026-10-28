'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import type { GalleryImage } from '@prisma/client'
import { GalleryCategory } from '@prisma/client'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import FilterPills from '@/components/ui/FilterPills'

const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  PERFORMANCE: 'Performance',
  PORTRAIT: 'Portraits',
  EVENTS: 'Events',
  BACKSTAGE: 'Backstage',
}

const lightboxBtn =
  'absolute flex h-12 w-12 items-center justify-center rounded-full border border-line bg-night/60 text-ivory transition-colors hover:border-gold hover:text-gold'

export default function GalleryView({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<'ALL' | GalleryCategory>('ALL')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = filter === 'ALL' ? images : images.filter((img) => img.category === filter)

  const close = useCallback(() => setLightbox(null), [])

  const goPrev = useCallback(() => {
    setLightbox((i) => (i === null || filtered.length === 0 ? i : (i - 1 + filtered.length) % filtered.length))
  }, [filtered.length])

  const goNext = useCallback(() => {
    setLightbox((i) => (i === null || filtered.length === 0 ? i : (i + 1) % filtered.length))
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

  const categories = (Object.keys(CATEGORY_LABEL) as GalleryCategory[]).filter((c) => images.some((i) => i.category === c))
  const options = [
    { label: 'All', value: 'ALL' as const, count: images.length },
    ...categories.map((c) => ({
      label: CATEGORY_LABEL[c],
      value: c,
      count: images.filter((i) => i.category === c).length,
    })),
  ]

  return (
    <>
      <section className="bg-night py-16 md:py-24">
        <div className="site-shell">
          {images.length > 0 && (
            <FilterPills
              label="Filter photos"
              options={options}
              value={filter}
              onChange={(v) => {
                setFilter(v)
                setLightbox(null)
              }}
            />
          )}

          <div className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightbox(i)}
                className="group mb-4 block w-full cursor-zoom-in break-inside-avoid border-0 bg-transparent p-0 text-left"
              >
                <span className={`relative block overflow-hidden ${i % 5 === 0 ? 'arch' : 'rounded-[20px]'}`}>
                  <Image
                    src={img.imagePath}
                    alt={img.caption ?? 'BeeJay Sax gallery photo'}
                    width={800}
                    height={1000}
                    className="block h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </span>
                {img.caption && <span className="mt-2 block font-body text-sm text-ivory/60">{img.caption}</span>}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-line px-6 py-20 text-center">
              <p className="font-display text-3xl text-ivory">No photos here yet</p>
              <p className="mx-auto mt-3 max-w-[44ch] font-body text-base text-ivory/65">
                New moments are added after every event. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {current && lightbox !== null && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-night/95 backdrop-blur-md"
          role="dialog"
          aria-modal
          aria-label="Photo viewer"
          onClick={close}
        >
          <button type="button" className={`${lightboxBtn} top-5 right-5`} onClick={close} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          {filtered.length > 1 && (
            <>
              <button
                type="button"
                className={`${lightboxBtn} top-1/2 left-4 -translate-y-1/2`}
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className={`${lightboxBtn} top-1/2 right-4 -translate-y-1/2`}
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <figure className="flex max-h-[88vh] max-w-[90vw] flex-col items-center px-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={current.imagePath}
              alt={current.caption ?? ''}
              width={1600}
              height={1200}
              className="mx-auto block max-h-[80vh] w-auto max-w-full rounded-[12px] object-contain"
            />
            <figcaption className="mt-4 text-center font-body text-sm text-ivory/70">
              {current.caption ? `${current.caption}  ` : ''}
              <span className="text-ivory/45">
                {lightbox + 1} of {filtered.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
