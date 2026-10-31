'use client'

import { useSyncExternalStore } from 'react'

/**
 * Cookie consent for the public site. The visitor's choice is kept in a first-party cookie,
 * `bjs_consent=v1.media=1.<timestamp>`, so there is a dated record of what they agreed to.
 * Bump CONSENT_VERSION when the cookie policy changes in a way that needs a fresh answer:
 * older records are then ignored and the banner asks again.
 */
export const CONSENT_COOKIE = 'bjs_consent'
export const CONSENT_VERSION = 'v1'
const MAX_AGE = 365 * 24 * 3600 // 12 months, then we ask again
const OPEN_EVENT = 'bjs:consent-open'

export type Consent = { media: boolean; at: number }

function parse(raw: string | null): Consent | null {
  if (!raw) return null
  const m = raw.match(/^(v\d+)\.media=([01])\.(\d+)$/)
  if (!m || m[1] !== CONSENT_VERSION) return null
  return { media: m[2] === '1', at: Number(m[3]) }
}

function readRaw(): string | null {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
  return hit ? decodeURIComponent(hit.slice(CONSENT_COOKIE.length + 1)) : null
}

const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function saveConsent(c: { media: boolean }) {
  const value = `${CONSENT_VERSION}.media=${c.media ? 1 : 0}.${Date.now()}`
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`
  listeners.forEach((fn) => fn())
}

/** Reopens the banner with the choices panel showing (footer "Cookie settings", the cookie policy). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function onConsentSettingsRequested(fn: () => void) {
  window.addEventListener(OPEN_EVENT, fn)
  return () => window.removeEventListener(OPEN_EVENT, fn)
}

/**
 * The visitor's current choice. `ready` is false during server render and hydration, when the
 * cookie can't be read yet; treat that like "no consent" so nothing third-party loads early.
 */
export function useConsent() {
  // undefined = not readable yet (server), null = no valid choice saved
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readRaw, () => undefined)
  const consent = raw === undefined ? null : parse(raw)
  return {
    ready: raw !== undefined,
    decided: consent !== null,
    media: consent?.media ?? false,
    acceptAll: () => saveConsent({ media: true }),
    rejectAll: () => saveConsent({ media: false }),
    save: saveConsent,
    openSettings: openConsentSettings,
  }
}
