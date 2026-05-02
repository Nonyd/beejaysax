'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import AdminInput from './AdminInput'
import AdminTextarea from './AdminTextarea'
import AdminSelect from './AdminSelect'
import AdminToggle from './AdminToggle'
import CloudinaryUpload from './CloudinaryUpload'
import AdminFormShell from './AdminFormShell'
import AdminSectionCard from './AdminSectionCard'
import type { Release, ReleaseType } from '@prisma/client'

interface ReleaseFormProps {
  mode: 'create' | 'edit'
  release?: Release | null
}

export default function ReleaseForm({ mode, release }: ReleaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(release?.title ?? '')
  const [slug, setSlug] = useState(release?.slug ?? '')
  const [releaseType, setReleaseType] = useState<ReleaseType>(release?.releaseType ?? 'SINGLE')
  const [description, setDescription] = useState(release?.description ?? '')
  const [coverImage, setCoverImage] = useState(release?.coverImage ?? '')
  const [spotifyUrl, setSpotifyUrl] = useState(release?.spotifyUrl ?? '')
  const [appleMusicUrl, setAppleMusicUrl] = useState(release?.appleMusicUrl ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(release?.youtubeUrl ?? '')
  const [audiomackUrl, setAudiomackUrl] = useState(release?.audiomackUrl ?? '')
  const [boomplayUrl, setBoomplayUrl] = useState(release?.boomplayUrl ?? '')
  const [releaseDate, setReleaseDate] = useState(
    release?.releaseDate ? new Date(release.releaseDate).toISOString().split('T')[0] : ''
  )
  const [isFeatured, setIsFeatured] = useState(release?.isFeatured ?? false)

  function autoSlug(val: string) {
    setTitle(val)
    if (mode === 'create') {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  async function handleSubmit() {
    if (!title || !slug) {
      toast.error('Title and slug are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title,
        slug,
        releaseType,
        description,
        coverImage: coverImage || null,
        spotifyUrl: spotifyUrl || null,
        appleMusicUrl: appleMusicUrl || null,
        youtubeUrl: youtubeUrl || null,
        audiomackUrl: audiomackUrl || null,
        boomplayUrl: boomplayUrl || null,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
        isFeatured,
      }

      const url = mode === 'create' ? '/api/releases' : `/api/releases/${release!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(mode === 'create' ? 'Release created!' : 'Release updated!')
        router.push('/admin/releases')
        router.refresh()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const streamingFields = [
    { label: 'Spotify URL', value: spotifyUrl, setter: setSpotifyUrl },
    { label: 'Apple Music URL', value: appleMusicUrl, setter: setAppleMusicUrl },
    { label: 'YouTube URL', value: youtubeUrl, setter: setYoutubeUrl },
    { label: 'Audiomack URL', value: audiomackUrl, setter: setAudiomackUrl },
    { label: 'Boomplay URL', value: boomplayUrl, setter: setBoomplayUrl },
  ]

  return (
    <AdminFormShell maxWidth={800}>
      <AdminSectionCard title="Release details" description="Title, slug, type, and optional description or date.">
        <AdminFormField label="Title *">
          <AdminInput value={title} onChange={(e) => autoSlug(e.target.value)} placeholder="Praise Session 1" />
        </AdminFormField>
        <AdminFormField label="Slug *">
          <AdminInput value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="praise-session-1" />
        </AdminFormField>
        <AdminFormField label="Type">
          <AdminSelect
            value={releaseType}
            onChange={(e) => setReleaseType(e.target.value as ReleaseType)}
            options={[
              { value: 'SINGLE', label: 'Single' },
              { value: 'ALBUM', label: 'Album' },
              { value: 'EP', label: 'EP' },
            ]}
          />
        </AdminFormField>
        <AdminFormField label="Description" optional>
          <AdminTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </AdminFormField>
        <AdminFormField label="Release Date" optional>
          <AdminInput type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
        </AdminFormField>
      </AdminSectionCard>

      <AdminSectionCard title="Cover image" description="Square artwork for listings and players.">
        <CloudinaryUpload
          onUpload={(url) => setCoverImage(url)}
          folder="beejaysax/releases"
          label="Upload Cover Art"
          currentUrl={coverImage || undefined}
          aspectRatio="square"
        />
        {coverImage && (
          <div className="flex max-w-full flex-wrap items-center gap-3">
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or paste Cloudinary URL directly..."
              className="min-w-0 flex-1 bg-[#0F0F0F] border border-[#1E1E1E] px-4 py-2 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
              style={{ fontSize: 11 }}
            />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              style={{
                fontSize: 11,
                color: '#f87171',
                border: '1px solid rgba(127,29,29,0.4)',
                padding: '8px 12px',
              }}
            >
              Remove
            </button>
          </div>
        )}
      </AdminSectionCard>

      <AdminSectionCard title="Streaming links" description="Optional URLs for each platform.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {streamingFields.map((field) => (
            <AdminFormField key={field.label} label={field.label} optional>
              <AdminInput value={field.value} onChange={(e) => field.setter(e.target.value)} placeholder="https://..." />
            </AdminFormField>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Settings">
        <AdminToggle
          checked={isFeatured}
          onChange={setIsFeatured}
          label="Featured release"
          description="Show this release on the homepage."
        />
      </AdminSectionCard>

      <div
        className="flex flex-wrap gap-3 border-t border-[#1E1E1E] pt-5"
        style={{ marginTop: 4, marginBottom: 8 }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#C9A84C] px-8 py-3 font-semibold text-[#080808] transition hover:bg-[#E8C96D] disabled:opacity-40"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Release' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-[#2A2A2A] px-8 py-3 text-white transition hover:border-[#555]"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Cancel
        </button>
      </div>
    </AdminFormShell>
  )
}
