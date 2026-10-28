import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * AES-256-GCM for secrets stored in the database.
 * Key: SETTINGS_ENCRYPTION_KEY (any long random string; it is hashed to 32 bytes).
 * Falls back to AUTH_SECRET / NEXTAUTH_SECRET so staging works without extra setup,
 * but production should set its own key and never change it (old values become unreadable).
 */
function key(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!raw) throw new Error('SETTINGS_ENCRYPTION_KEY is not set')
  return createHash('sha256').update(raw).digest()
}

const PREFIX = 'v1:'

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptSecret(stored: string): string | null {
  if (!stored.startsWith(PREFIX)) return null
  try {
    const buf = Buffer.from(stored.slice(PREFIX.length), 'base64')
    const decipher = createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12))
    decipher.setAuthTag(buf.subarray(12, 28))
    return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

/** Constant-time string comparison (for webhook secrets, PINs, cron tokens). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function maskSecret(value: string): string {
  if (!value) return ''
  return value.length <= 8 ? '••••' : `••••${value.slice(-4)}`
}
