'use client'

import { openConsentSettings } from '@/components/consent/consent'

/** Reopens the cookie banner's choices panel. Usable from server components (footer, cookie policy). */
export default function CookieSettingsButton({ className, children = 'Cookie settings' }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  )
}
