'use client'

import { useRef, useState, type CSSProperties } from 'react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  folder?: string
  label?: string
  currentUrl?: string
  aspectRatio?: 'square' | 'poster' | 'free'
  /** Accept several files at once; onUpload is called once per uploaded image. */
  multiple?: boolean
}

export default function ImageUpload({
  onUpload,
  folder = 'beejaysax',
  label = 'Upload Image',
  currentUrl,
  aspectRatio = 'free',
  multiple = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function validate(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return `${file.name}: only JPG, PNG, and WebP images are allowed`
    }
    if (file.size > 10 * 1024 * 1024) return `${file.name}: image must be under 10MB`
    return null
  }

  async function uploadOne(file: File) {
    // Saved on our own server, under /uploads
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await uploadRes.json().catch(() => ({}))
    if (!uploadRes.ok || !data.url) throw new Error(data.error || 'Upload failed')
    return data.url as string
  }

  async function handleFiles(list: FileList | File[]) {
    const files = Array.from(list).slice(0, multiple ? undefined : 1)
    if (files.length === 0) return

    const errors: string[] = []
    const valid = files.filter((file) => {
      const problem = validate(file)
      if (problem) errors.push(problem)
      return !problem
    })

    setUploading(true)
    setError('')
    setProgress({ done: 0, total: valid.length })

    // One at a time keeps the order the admin picked and spares the server
    for (const [i, file] of valid.entries()) {
      try {
        onUpload(await uploadOne(file))
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : 'upload failed'}`)
      }
      setProgress({ done: i + 1, total: valid.length })
    }

    setError(errors.join('\n'))
    setUploading(false)
    setProgress(null)
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
          style={{ ...previewStyle, marginBottom: 12, border: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)' }}
        />
      )}

      {/* Drop zone — width capped so it doesn’t span the whole dashboard */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (!uploading) handleFiles(e.dataTransfer.files)
        }}
        style={{
          border: '1px dashed color-mix(in srgb, var(--ivory) 20%, transparent)',
          padding: '20px 14px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: 'var(--night-2)',
          transition: 'border-color 0.2s',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => !uploading && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'color-mix(in srgb, var(--ivory) 20%, transparent)')}
      >
        <p style={{ fontSize: 22, marginBottom: 6 }}>📁</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: uploading ? 'var(--gold)' : 'color-mix(in srgb, var(--ivory) 80%, transparent)' }}>
          {uploading
            ? progress && progress.total > 1
              ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}...`
              : 'Uploading...'
            : label}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)', marginTop: 6, lineHeight: 1.4 }}>
          {uploading
            ? 'Please wait'
            : `Click or drag & drop${multiple ? ' · select several at once' : ''} · JPG, PNG, WebP · Max 10MB${multiple ? ' each' : ''}`}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8, whiteSpace: 'pre-line' }}>{error}</p>}
    </div>
  )
}
