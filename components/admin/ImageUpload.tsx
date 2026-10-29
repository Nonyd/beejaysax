'use client'

import { useRef, useState, type CSSProperties } from 'react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  folder?: string
  label?: string
  currentUrl?: string
  aspectRatio?: 'square' | 'poster' | 'free'
}

export default function ImageUpload({
  onUpload,
  folder = 'beejaysax',
  label = 'Upload Image',
  currentUrl,
  aspectRatio = 'free',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file) return

    // Validate
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Saved on our own server, under /uploads
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await uploadRes.json().catch(() => ({}))
      if (!uploadRes.ok || !data.url) throw new Error(data.error || 'Upload failed')

      onUpload(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const dropMaxW =
    aspectRatio === 'square' ? 320 : aspectRatio === 'poster' ? 260 : 420

  const previewStyle: CSSProperties =
    aspectRatio === 'square'
      ? { aspectRatio: '1/1', objectFit: 'cover', width: '100%', maxWidth: 240, display: 'block' }
      : aspectRatio === 'poster'
        ? { aspectRatio: '3/4', objectFit: 'cover', width: '100%', maxWidth: 200, display: 'block' }
        : { height: 120, objectFit: 'cover', width: '100%', maxWidth: 360, display: 'block' }

  return (
    <div style={{ width: '100%', maxWidth: dropMaxW }}>
      {/* Current image preview */}
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Current upload"
          style={{ ...previewStyle, marginBottom: 12, border: '1px solid rgba(247,241,227,0.12)' }}
        />
      )}

      {/* Drop zone — width capped so it doesn’t span the whole dashboard */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        style={{
          border: '1px dashed rgba(247,241,227,0.2)',
          padding: '20px 14px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: '#141838',
          transition: 'border-color 0.2s',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => !uploading && ((e.currentTarget as HTMLDivElement).style.borderColor = '#E3B23C')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(247,241,227,0.2)')}
      >
        <p style={{ fontSize: 22, marginBottom: 6 }}>📁</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: uploading ? '#E3B23C' : 'rgba(247,241,227,0.8)' }}>
          {uploading ? 'Uploading...' : label}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,241,227,0.55)', marginTop: 6, lineHeight: 1.4 }}>
          {uploading ? 'Please wait' : 'Click or drag & drop · JPG, PNG, WebP · Max 10MB'}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
