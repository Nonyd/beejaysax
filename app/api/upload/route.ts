import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { saveUpload, UploadError } from '@/lib/uploads'

export async function POST(req: NextRequest) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 })
    }
    const url = await saveUpload(file, form.get('folder'))
    return NextResponse.json({ url })
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('[/api/upload]', err)
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }
}
