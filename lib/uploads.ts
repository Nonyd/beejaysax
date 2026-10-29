import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Photos uploaded in the admin are stored on the server's own disk and served from /uploads/….
 * The deploy never touches this folder (see .github/workflows/deploy.yml).
 */
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'))

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export class UploadError extends Error {}

const TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
} as const
type Ext = keyof typeof TYPES

/** Trust the file's bytes, not its name or the browser's claimed type. */
function sniff(buf: Buffer): Ext | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return null
}

/** "beejaysax/events" → "events"; anything odd → "misc". */
function cleanFolder(folder: unknown): string {
  const last = String(folder ?? '').split('/').filter(Boolean).pop()?.toLowerCase() ?? ''
  return /^[a-z0-9-]{1,40}$/.test(last) ? last : 'misc'
}

/** Saves an uploaded image and returns its public path, e.g. /uploads/events/lx3k2a-9f1c2b3d4e5f.jpg */
export async function saveUpload(file: File, folder: unknown): Promise<string> {
  if (file.size === 0) throw new UploadError('The file is empty.')
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Image must be under 10MB.')
  const buf = Buffer.from(await file.arrayBuffer())
  const ext = sniff(buf)
  if (!ext) throw new UploadError('Only JPG, PNG and WebP images are allowed.')

  const dir = cleanFolder(folder)
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`
  await mkdir(path.join(UPLOAD_ROOT, dir), { recursive: true })
  await writeFile(path.join(UPLOAD_ROOT, dir, name), buf, { flag: 'wx' })
  return `/uploads/${dir}/${name}`
}

/** Reads a stored upload by its path segments; null when it doesn't exist or the path is unsafe. */
export async function readUpload(segments: string[]): Promise<{ body: Buffer; type: string } | null> {
  if (segments.length !== 2 || !segments.every((s) => /^[a-z0-9][a-z0-9._-]*$/i.test(s) && !s.includes('..'))) return null
  const ext = path.extname(segments[1]).slice(1).toLowerCase() as Ext
  if (!(ext in TYPES)) return null
  const file = path.join(UPLOAD_ROOT, ...segments)
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return null
  try {
    return { body: await readFile(file), type: TYPES[ext] }
  } catch {
    return null
  }
}
