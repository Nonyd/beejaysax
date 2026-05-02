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
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (err) {
    console.error('[/api/upload]', err)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
