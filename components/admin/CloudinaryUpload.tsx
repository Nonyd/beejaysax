'use client'

import { useRef, useState, type CSSProperties } from 'react'

interface CloudinaryUploadProps {
  onUpload: (url: string) => void
  folder?: string
  label?: string
  currentUrl?: string
  aspectRatio?: 'square' | 'poster' | 'free'
}

export default function CloudinaryUpload({
  onUpload,
  folder = 'beejaysax',
  label = 'Upload Image',
  currentUrl,
  aspectRatio = 'free',
}: CloudinaryUploadProps) {
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
      // Get signed upload params from our API
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      })
      if (!sigRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json()

      // Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', String(timestamp))
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Upload failed')

      const data = await uploadRes.json()
      onUpload(data.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const previewStyle: CSSProperties =
    aspectRatio === 'square'
      ? { aspectRatio: '1/1', objectFit: 'cover', width: '100%', maxWidth: 200, display: 'block' }
      : aspectRatio === 'poster'
        ? { aspectRatio: '3/4', objectFit: 'cover', width: '100%', maxWidth: 150, display: 'block' }
        : { height: 120, objectFit: 'cover', width: '100%', maxWidth: 300, display: 'block' }

  return (
    <div>
      {/* Current image preview */}
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Current upload"
          style={{ ...previewStyle, marginBottom: 12, border: '1px solid #2A2A2A' }}
        />
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        style={{
          border: '1px dashed #2A2A2A',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: '#111',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => !uploading && ((e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A')}
      >
        <p style={{ fontSize: 24, marginBottom: 8 }}>📁</p>
        <p style={{ fontSize: 13, color: uploading ? '#C9A84C' : '#888' }}>
          {uploading ? 'Uploading...' : label}
        </p>
        <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
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
