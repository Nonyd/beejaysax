import { readUpload } from '@/lib/uploads'

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = await readUpload((await params).path)
  if (!file) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(file.body), {
    headers: {
      'Content-Type': file.type,
      // File names are unique per upload, so they never change.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
