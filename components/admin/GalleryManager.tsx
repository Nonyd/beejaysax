'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import ImageUpload from './ImageUpload'
import AdminFormShell from './AdminFormShell'
import AdminSectionCard from './AdminSectionCard'

interface GalleryImageRow {
  id: string
  imagePath: string
  caption: string | null
  category: string
  sortOrder: number
}

const CATEGORIES = ['PERFORMANCE', 'PORTRAIT', 'EVENTS', 'BACKSTAGE']

export default function GalleryManager({ initialImages }: { initialImages: GalleryImageRow[] }) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('PERFORMANCE')
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? images : images.filter((img) => img.category === filter)

  async function handleAddImages() {
    if (pending.length === 0) {
      toast.error('Upload at least one image first')
      return
    }
    setUploading(true)
    const added: GalleryImageRow[] = []
    const failed: string[] = []
    // Saved in order so the gallery keeps the order the photos were picked in
    for (const [i, imagePath] of pending.entries()) {
      try {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePath,
            caption: caption.trim() || null,
            category,
            sortOrder: images.length + i,
          }),
        })
        if (!res.ok) throw new Error()
        added.push((await res.json()) as GalleryImageRow)
      } catch {
        failed.push(imagePath)
      }
    }
    setImages((prev) => [...prev, ...added])
    setPending(failed)
    if (failed.length === 0) setCaption('')
    if (added.length > 0) toast.success(added.length === 1 ? 'Image added!' : `${added.length} images added!`)
    if (failed.length > 0) toast.error(`${failed.length} image${failed.length === 1 ? '' : 's'} could not be saved`)
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id))
      toast.success('Image deleted')
    } else {
      toast.error('Delete failed')
    }
  }

  async function handleUpdateCaption(id: string, newCaption: string) {
    await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: newCaption }),
    })
  }

  return (
    <div>
      <AdminFormShell maxWidth={800}>
        <div className="mb-8">
          <AdminSectionCard
            title="Add images"
            description="Upload one or more photos, then pick a category (and optional caption) for the batch before saving."
          >
            <AdminFormField label="Upload Images *">
              <ImageUpload
                onUpload={(url) => setPending((prev) => [...prev, url])}
                folder="beejaysax/gallery"
                label="Upload Gallery Photos"
                aspectRatio="free"
                multiple
              />
              {pending.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {pending.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative aspect-square border border-ivory/12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPending((prev) => prev.filter((_, j) => j !== i))}
                        disabled={uploading}
                        aria-label="Remove from batch"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white transition hover:bg-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminFormField>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Caption
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional, applied to every image..."
                className="w-full border border-ivory/12 bg-ink px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-ivory/12 bg-ink px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
            <button
              type="button"
              onClick={handleAddImages}
              disabled={uploading || pending.length === 0}
              className="bg-gold px-6 py-2.5 font-semibold text-night transition hover:bg-gold-lt disabled:opacity-40"
              style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {uploading
                ? 'Adding...'
                : pending.length > 1
                  ? `Add ${pending.length} Images`
                  : 'Add Image'}
            </button>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)', margin: 0 }}>
              Folder: <code style={{ color: 'color-mix(in srgb, var(--ivory) 70%, transparent)' }}>beejaysax/gallery</code>
            </p>
          </AdminSectionCard>
        </div>
      </AdminFormShell>

      <div className="mb-6 flex flex-wrap gap-0">
        {['ALL', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className="border border-ivory/20 px-4 py-2 transition"
            style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: filter === cat ? 'var(--gold)' : 'transparent',
              color: filter === cat ? 'var(--night)' : 'color-mix(in srgb, var(--ivory) 55%, transparent)',
              marginLeft: cat === 'ALL' ? 0 : -1,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((image) => (
          <div
            key={image.id}
            className="group relative border border-ivory/12 bg-ink transition hover:border-gold"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image src={image.imagePath} alt={image.caption ?? 'Gallery image'} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="rounded-full bg-red-900/80 px-4 py-1.5 text-sm text-white transition hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="p-3">
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  background: 'color-mix(in srgb, var(--gold) 10%, transparent)',
                  padding: '1px 6px',
                  border: '1px solid color-mix(in srgb, var(--gold) 20%, transparent)',
                }}
              >
                {image.category}
              </span>
              <input
                defaultValue={image.caption ?? ''}
                onBlur={(e) => handleUpdateCaption(image.id, e.target.value)}
                placeholder="Add caption..."
                className="mt-2 w-full border-none bg-transparent text-xs text-ivory/70 placeholder:text-ivory/35 focus:text-ivory focus:outline-none"
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-4 border border-ivory/12 bg-ink p-12 text-center">
            <p style={{ color: 'color-mix(in srgb, var(--ivory) 45%, transparent)', fontSize: 14 }}>No images in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
