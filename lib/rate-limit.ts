/**
 * Small in-memory rate limits for the public forms. They are per server process and reset on
 * restart, which is enough to stop scripted floods without a separate store.
 */

/**
 * The visitor's IP. The site sits behind Cloudflare, which overwrites cf-connecting-ip on every
 * request. The first X-Forwarded-For entry is whatever the client sent, so only the last hop
 * (added by our own proxy) is used as a fallback.
 */
export function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip')?.trim()
  if (cf) return cf
  const hops = req.headers.get('x-forwarded-for')?.split(',').map((h) => h.trim()).filter(Boolean)
  return hops?.at(-1) ?? 'unknown'
}

const buckets = new Map<string, Map<string, number[]>>()

function hitsFor(bucket: string, key: string, windowMs: number, now: number) {
  let b = buckets.get(bucket)
  if (!b) buckets.set(bucket, (b = new Map()))
  // Drop stale keys now and then so spoofed or one-off keys can't grow memory forever.
  if (b.size > 5000) for (const [k, v] of b) if (!v.some((t) => now - t < windowMs)) b.delete(k)
  const recent = (b.get(key) ?? []).filter((t) => now - t < windowMs)
  b.set(key, recent)
  return recent
}

/** Records one hit and says whether the key is still within `max` hits per window. */
export function rateLimit(bucket: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = hitsFor(bucket, key, windowMs, now)
  recent.push(now)
  return recent.length <= max
}

/** True while the key has `max` or more recorded hits in the window (does not record one). */
export function isLimited(bucket: string, key: string, max: number, windowMs: number): boolean {
  return hitsFor(bucket, key, windowMs, Date.now()).length >= max
}

/** Records a failure without checking, for "count only wrong attempts" limits. */
export function recordHit(bucket: string, key: string, windowMs: number) {
  const now = Date.now()
  hitsFor(bucket, key, windowMs, now).push(now)
}

export function clearHits(bucket: string, key: string) {
  buckets.get(bucket)?.delete(key)
}

export const tooMany = (wait = 'a few minutes') => ({ error: `Too many attempts. Try again in ${wait}.` })
