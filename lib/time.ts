import { format } from 'date-fns'

/** All event times are shown in the venue's time zone, whatever time zone the server runs in. */
export const SITE_TZ = process.env.SITE_TIMEZONE ?? 'Africa/Lagos'

/** A Date whose local fields equal the wall-clock time in SITE_TZ (for formatting only). */
export function zoned(d: Date, tz = SITE_TZ): Date {
  return new Date(d.toLocaleString('en-US', { timeZone: tz }))
}

/** date-fns `format`, but in the site time zone. */
export function fmt(d: Date, pattern: string, tz = SITE_TZ): string {
  return format(zoned(d, tz), pattern)
}

/** Midnight-to-midnight day key in the site time zone, e.g. "2026-05-24". */
export function dayKey(d: Date, tz = SITE_TZ): string {
  return fmt(d, 'yyyy-MM-dd', tz)
}

/** Hour of day (0-23) in the site time zone. */
export function hourIn(d: Date, tz = SITE_TZ): number {
  return Number(fmt(d, 'H', tz))
}
