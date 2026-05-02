'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import CloudinaryUpload from './CloudinaryUpload'
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
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('PERFORMANCE')
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? images : images.filter((img) => img.category === filter)

  async function handleAddImage() {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    setUploading(true)
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: imageUrl.trim(),
          caption: caption.trim() || null,
          category,
          sortOrder: images.length,
        }),
      })
      if (res.ok) {
        const newImage = (await res.json()) as GalleryImageRow
        setImages((prev) => [...prev, newImage])
        setImageUrl('')
        setCaption('')
        toast.success('Image added!')
      } else {
        toast.error('Failed to add image')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
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
            title="Add image"
            description="Upload to Cloudinary, then add a caption and category before saving."
          >
            <AdminFormField label="Upload Image *">
              <CloudinaryUpload
                onUpload={(url) => setImageUrl(url)}
                folder="beejaysax/gallery"
                label="Upload Gallery Photo"
                currentUrl={imageUrl || undefined}
                aspectRatio="free"
              />
              {imageUrl && (
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cloudinary URL"
                  className="mt-2 w-full border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-2 text-xs text-white focus:border-[#C9A84C] focus:outline-none"
                />
              )}
            </AdminFormField>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Caption
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption..."
                className="w-full border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-2.5 text-sm text-white focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-2.5 text-sm text-white focus:border-[#C9A84C] focus:outline-none"
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
              onClick={handleAddImage}
              disabled={uploading || !imageUrl.trim()}
              className="bg-[#C9A84C] px-6 py-2.5 font-semibold text-[#080808] transition hover:bg-[#E8C96D] disabled:opacity-40"
              style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {uploading ? 'Adding...' : 'Add Image'}
            </button>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#555', margin: 0 }}>
              Folder: <code style={{ color: '#888' }}>beejaysax/gallery</code>
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
            className="border border-[#2A2A2A] px-4 py-2 transition"
            style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: filter === cat ? '#C9A84C' : 'transparent',
              color: filter === cat ? '#080808' : '#555',
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
            className="group relative border border-[#1E1E1E] bg-[#0F0F0F] transition hover:border-[#C9A84C]"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image src={image.imagePath} alt={image.caption ?? 'Gallery image'} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="bg-red-900/80 px-3 py-1.5 text-xs text-white transition hover:bg-red-800"
                  style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
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
                  color: '#C9A84C',
                  background: 'rgba(201,168,76,0.1)',
                  padding: '1px 6px',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                {image.category}
              </span>
              <input
                defaultValue={image.caption ?? ''}
                onBlur={(e) => handleUpdateCaption(image.id, e.target.value)}
                placeholder="Add caption..."
                className="mt-2 w-full border-none bg-transparent text-xs text-[#888] placeholder:text-[#333] focus:text-white focus:outline-none"
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-4 border border-[#1E1E1E] bg-[#0F0F0F] p-12 text-center">
            <p style={{ color: '#444', fontSize: 14 }}>No images in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
