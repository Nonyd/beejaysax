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

  const filtered = filter === 'ALL' ? images : images.filter((img) => img.category === filter)

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
      <div
        className="sticky z-30 border-b"
        style={{ top: 72, background: '#080808', borderColor: '#1E1E1E' }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap px-6 md:px-12">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setFilter(f.value)
                setLightbox(null)
              }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '16px 16px',
                border: 'none',
                borderBottom: filter === f.value ? '2px solid #C9A84C' : '2px solid transparent',
                background: 'transparent',
                color: filter === f.value ? '#C9A84C' : '#555',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(i)}
              className="mb-3 block w-full cursor-zoom-in break-inside-avoid border-0 bg-transparent p-0 text-left"
            >
              <div
                style={{ position: 'relative', overflow: 'hidden' }}
                className="transition-transform duration-300 hover:scale-[1.03] hover:brightness-110"
              >
                <Image
                  src={img.imagePath}
                  alt={img.caption ?? 'BeeJay Sax — gallery photo'}
                  width={800}
                  height={1000}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                  sizes="25vw"
                />
              </div>
              {img.caption && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#555', marginTop: 8 }}>{img.caption}</p>
              )}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555' }}>No images in this category.</p>
        )}
      </section>

      {current && lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(8px)' }}
          role="dialog"
          aria-modal
          aria-label="Image preview"
        >
          <button
            type="button"
            style={{
              position: 'absolute',
              right: 24,
              top: 24,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #2A2A2A',
              background: 'transparent',
              color: '#F5F0E8',
              cursor: 'pointer',
            }}
            onClick={close}
            aria-label="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
          <button
            type="button"
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #2A2A2A',
              background: 'transparent',
              color: '#F5F0E8',
              cursor: 'pointer',
            }}
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft style={{ width: 24, height: 24 }} />
          </button>
          <button
            type="button"
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #2A2A2A',
              background: 'transparent',
              color: '#F5F0E8',
              cursor: 'pointer',
            }}
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight style={{ width: 24, height: 24 }} />
          </button>
          <div style={{ display: 'flex', maxHeight: '85vh', maxWidth: '90vw', flexDirection: 'column', alignItems: 'center', padding: '0 64px' }}>
            <div style={{ position: 'relative', maxHeight: '80vh', width: '100%', maxWidth: '90vw' }}>
              <Image
                src={current.imagePath}
                alt={current.caption ?? ''}
                width={1600}
                height={1200}
                style={{ maxHeight: '80vh', width: 'auto', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
            </div>
            {current.caption && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#555', marginTop: 16, textAlign: 'center' }}>
                {current.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
