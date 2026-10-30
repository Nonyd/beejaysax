import { createHmac, randomBytes, scrypt as scryptCb, scryptSync } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(scryptCb) as (pin: string, salt: string, len: number) => Promise<Buffer>
import { safeEqual } from '@/lib/secret-box'

/** Volunteer check-in PINs are stored as salted scrypt hashes, never in plain text. */
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pin, salt, 32).toString('hex')}`
}

/** Async so a flood of guesses can't block the server while each one is hashed. */
export async function verifyPin(pin: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  return safeEqual((await scrypt(pin, salt, 32)).toString('hex'), hash)
}

/** New PINs need 6 to 8 digits; 4-digit PINs are too quick to guess. */
export function isValidPin(pin: string) {
  return /^\d{6,8}$/.test(pin)
}

/* Check-in pass: a signed cookie that lets a volunteer scan for one event without an admin login. */
function passSecret() {
  const s = process.env.SETTINGS_ENCRYPTION_KEY ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!s) throw new Error('No signing secret configured')
  return s
}

export const CHECKIN_COOKIE = 'bjs_checkin'
const PASS_HOURS = 12

export function signCheckinPass(eventId: string, pinHash: string): string {
  const exp = Date.now() + PASS_HOURS * 3600_000
  // Binding to the PIN hash means changing the PIN revokes every issued pass.
  const payload = `${eventId}.${exp}`
  const sig = createHmac('sha256', passSecret()).update(`${payload}.${pinHash}`).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyCheckinPass(value: string | undefined, eventId: string, pinHash: string | null): boolean {
  if (!value || !pinHash) return false
  const [id, exp, sig] = value.split('.')
  if (id !== eventId || !exp || !sig || Number(exp) < Date.now()) return false
  const expected = createHmac('sha256', passSecret()).update(`${id}.${exp}.${pinHash}`).digest('base64url')
  return safeEqual(sig, expected)
}

export const CHECKIN_PASS_MAX_AGE = PASS_HOURS * 3600
