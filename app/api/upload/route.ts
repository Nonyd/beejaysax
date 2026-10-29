import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveUpload, UploadError } from '@/lib/uploads'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
