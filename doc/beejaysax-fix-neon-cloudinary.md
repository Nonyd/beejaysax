# 🎷 BEEJAY SAX — Fix: Neon.tech + Cloudinary Setup
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## CONTEXT

The BeeJay Sax website is fully built. Two external services are not yet
connected: Neon.tech (PostgreSQL database) and Cloudinary (image hosting).
This prompt fixes both completely.

DO NOT touch any other files. Only fix what is listed here.

---

## PART 1 — NEON.TECH (DATABASE)

### Step 1 — Create your Neon project

1. Go to https://neon.tech and sign in (free tier is enough)
2. Click **New Project**
3. Name it: `beejaysax`
4. Region: choose closest to Nigeria — `AWS eu-west-2 (London)` or `AWS us-east-1`
5. Click **Create Project**
6. Neon will show you a connection string. Click **Connection Details**
7. Set the dropdown to **Prisma**
8. Copy BOTH connection strings shown — they look like this:

```
# This goes in DATABASE_URL (pooled — for app queries)
postgresql://beejaysax_owner:XXXX@ep-xxx-xxx.eu-west-2.aws.neon.tech/beejaysax?sslmode=require

# This goes in DIRECT_URL (direct — for migrations)
postgresql://beejaysax_owner:XXXX@ep-xxx-xxx.eu-west-2.aws.neon.tech/beejaysax?sslmode=require
```

For the DATABASE_URL (pooled), append these params:
`&pgbouncer=true&connection_limit=1`

---

### Step 2 — Update `.env.local`

Open `.env.local` and set these two values with your real Neon strings:

```env
DATABASE_URL="postgresql://beejaysax_owner:YOUR_PASSWORD@ep-xxx.eu-west-2.aws.neon.tech/beejaysax?sslmode=require&pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://beejaysax_owner:YOUR_PASSWORD@ep-xxx.eu-west-2.aws.neon.tech/beejaysax?sslmode=require"
```

The DATABASE_URL uses pgbouncer (connection pooling).
The DIRECT_URL is used by Prisma migrate/push directly.

---

### Step 3 — Update `prisma/schema.prisma`

Confirm the datasource block looks exactly like this (add `directUrl` if missing):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

### Step 4 — Push schema and seed

Run these commands in the terminal:

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

Expected output from seed:
```
✅ Seed complete. Admin login: admin / BeejaySax2026!
```

If `db push` fails:
- Double-check the connection strings have no extra spaces or line breaks
- Make sure `?sslmode=require` is present
- Try opening the Neon dashboard → your project → SQL Editor and running:
  `SELECT 1;`
  If that works, the credentials are correct

---

### Step 5 — Verify connection locally

Run the dev server:
```bash
npm run dev
```

Visit http://localhost:3000 — if the homepage loads events/releases from DB, Neon is connected.
Visit http://localhost:3000/admin → login → dashboard should show stats from DB.

---

## PART 2 — CLOUDINARY (IMAGE HOSTING)

### Step 1 — Create your Cloudinary account

1. Go to https://cloudinary.com and sign up (free tier: 25GB storage, 25GB bandwidth/month)
2. After signup, go to your **Dashboard**
3. You will see three values — copy all three:
   - **Cloud Name** (e.g. `dxxxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

---

### Step 2 — Update `.env.local`

Add these values:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

Note: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is the same value as `CLOUDINARY_CLOUD_NAME`.
The `NEXT_PUBLIC_` prefix makes it available in the browser for upload widgets.

---

### Step 3 — Create upload presets in Cloudinary

In the Cloudinary dashboard:
1. Go to **Settings** → **Upload** → scroll to **Upload Presets**
2. Click **Add upload preset**
3. Set:
   - Preset name: `beejaysax_unsigned`
   - Signing mode: **Unsigned**
   - Folder: `beejaysax`
4. Click **Save**

Create a second preset:
1. Click **Add upload preset** again
2. Set:
   - Preset name: `beejaysax_events`
   - Signing mode: **Unsigned**
   - Folder: `beejaysax/events`
3. Click **Save**

These presets allow direct browser uploads without exposing your API secret.

---

### Step 4 — Update `lib/cloudinary.ts`

Create or replace this file completely:

```ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export default cloudinary

export const CLOUDINARY_UPLOAD_PRESET = 'beejaysax_unsigned'
export const CLOUDINARY_EVENTS_PRESET = 'beejaysax_events'
export const CLOUDINARY_CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

// Helper to build a Cloudinary URL with transformations
export function cloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpg'
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options
  const transforms = [
    width  && `w_${width}`,
    height && `h_${height}`,
    crop   && `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}
```

---

### Step 5 — Update `app/api/upload/route.ts`

Replace completely:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { folder = 'beejaysax', publicId } = await req.json()

    const timestamp = Math.round(Date.now() / 1000)

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    }
    if (publicId) paramsToSign.public_id = publicId

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY,
    })
  } catch (err) {
    console.error('[/api/upload]', err)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
```

---

### Step 6 — Create `components/admin/CloudinaryUpload.tsx`

This is a reusable upload button for the admin panel.
It uses direct unsigned upload to Cloudinary (no server round-trip for the image itself).

```tsx
'use client'

import { useRef, useState } from 'react'

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
      formData.append('timestamp', timestamp)
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!uploadRes.ok) throw new Error('Upload failed')

      const data = await uploadRes.json()
      onUpload(data.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const previewStyle: React.CSSProperties =
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
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
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
        onMouseEnter={e => !uploading && ((e.currentTarget as HTMLDivElement).style.borderColor = '#C9A84C')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A')}
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
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && (
        <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</p>
      )}
    </div>
  )
}
```

---

### Step 7 — Wire CloudinaryUpload into EventForm

Open `components/admin/EventForm.tsx`.

Find the **Poster Image** section. It currently has a plain URL input. 
Replace that entire section with this:

```tsx
// Add import at top of file:
import CloudinaryUpload from './CloudinaryUpload'

// Replace the poster image section:
<section>
  <p className="section-label mb-4">Poster Image</p>
  <CloudinaryUpload
    onUpload={(url) => setPosterImage(url)}
    folder="beejaysax/events"
    label="Upload Event Poster"
    currentUrl={posterImage || undefined}
    aspectRatio="poster"
  />
  {posterImage && (
    <div className="mt-3 flex items-center gap-3">
      <input
        value={posterImage}
        onChange={e => setPosterImage(e.target.value)}
        placeholder="Or paste Cloudinary URL directly..."
        className="flex-1 bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
        style={{ fontSize: 11 }}
      />
      <button
        onClick={() => setPosterImage('')}
        style={{ fontSize: 11, color: '#f87171', border: '1px solid rgba(127,29,29,0.4)', padding: '8px 12px' }}
      >
        Remove
      </button>
    </div>
  )}
</section>
```

---

### Step 8 — Wire CloudinaryUpload into ReleaseForm

Open `components/admin/ReleaseForm.tsx`.

Find the **Cover Image** section. Replace with:

```tsx
// Add import at top of file:
import CloudinaryUpload from './CloudinaryUpload'

// Replace the cover image section:
<section>
  <p className="section-label mb-4">Cover Image</p>
  <CloudinaryUpload
    onUpload={(url) => setCoverImage(url)}
    folder="beejaysax/releases"
    label="Upload Cover Art"
    currentUrl={coverImage || undefined}
    aspectRatio="square"
  />
  {coverImage && (
    <div className="mt-3 flex items-center gap-3">
      <input
        value={coverImage}
        onChange={e => setCoverImage(e.target.value)}
        placeholder="Or paste Cloudinary URL directly..."
        className="flex-1 bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
        style={{ fontSize: 11 }}
      />
      <button
        onClick={() => setCoverImage('')}
        style={{ fontSize: 11, color: '#f87171', border: '1px solid rgba(127,29,29,0.4)', padding: '8px 12px' }}
      >
        Remove
      </button>
    </div>
  )}
</section>
```

---

### Step 9 — Wire CloudinaryUpload into GalleryManager

Open `components/admin/GalleryManager.tsx`.

Find the **Add Image** form. It currently has a plain URL input.
Replace the entire URL input field with:

```tsx
// Add import at top of file:
import CloudinaryUpload from './CloudinaryUpload'

// Replace the image URL field with:
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
      onChange={e => setImageUrl(e.target.value)}
      placeholder="Cloudinary URL"
      className="w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-white text-xs focus:border-[#C9A84C] focus:outline-none mt-2"
    />
  )}
</AdminFormField>
```

---

### Step 10 — Test uploads end to end

```
1. npm run dev
2. Go to http://localhost:3000/admin/events/new
3. Drag or click the poster upload area
4. Select a JPG image
5. Should show "Uploading..." then display the image preview
6. The image URL field below should auto-fill with a Cloudinary URL
   (starts with https://res.cloudinary.com/your-cloud-name/...)
7. Save the event — the poster should appear on /admin/events table
8. Visit /events — event card should show the poster image

9. Repeat for /admin/releases/new (cover art)
10. Repeat for /admin/gallery (gallery photos)
```

---

## PART 3 — VERIFY COMPLETE .env.local

After both setups, your `.env.local` should have ALL of these filled in
(no empty values, no placeholder text):

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/beejaysax?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/beejaysax?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Resend
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="tickets@beejaysax.com"
ADMIN_EMAIL="admin@beejaysax.com"

# Tickets
ADMIN_VERIFY_KEY="your-strong-random-key"
NEXT_PUBLIC_ADMIN_VERIFY_KEY="same-value-as-ADMIN_VERIFY_KEY"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Generate NEXTAUTH_SECRET and ADMIN_VERIFY_KEY with:
```bash
openssl rand -base64 32
```
Run it twice — one value for each.

---

## PART 4 — VERCEL ENVIRONMENT VARIABLES

When you deploy to Vercel, add EVERY variable from the list above
in Vercel dashboard → Settings → Environment Variables.

Change these two for production:
```
NEXTAUTH_URL          → https://beejaysax.com  (or your vercel preview URL first)
NEXT_PUBLIC_SITE_URL  → https://beejaysax.com  (or your vercel preview URL first)
```

---

## FINAL TEST CHECKLIST

```
□ npx prisma db push     → no errors
□ npx prisma db seed     → "✅ Seed complete"
□ npm run dev            → homepage loads
□ /admin login works     → admin / BeejaySax2026!
□ Dashboard shows stats  → numbers from DB (not zeros)
□ Upload event poster    → image appears in Cloudinary dashboard
□ Upload release cover   → image appears in Cloudinary dashboard
□ Upload gallery photo   → image appears in /gallery
□ npm run build          → zero errors
```

---

*BeeJay Sax — Neon + Cloudinary integration*
*Built by SonsHub Media Ltd.*
