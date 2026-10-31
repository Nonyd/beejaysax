'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { onConsentSettingsRequested, useConsent } from '@/components/consent/consent'

// All three choices share one style: rejecting must be as easy and as visible as accepting.
const choice =
  'rounded-full border border-gold/70 px-5 py-2.5 font-body text-sm font-semibold text-ivory transition-colors hover:bg-gold hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/**
 * Cookie banner for the public site. Shows on the first visit (and after a policy version bump)
 * until the visitor chooses, and again whenever "Cookie settings" is pressed. It sits above the
 * mini player and never blocks the page. Nothing non-essential loads until "media" is allowed.
 */
export default function ConsentBanner() {
  const { ready, decided, media, acceptAll, rejectAll, save } = useConsent()
  const [reopened, setReopened] = useState(false)
  const [custom, setCustom] = useState(false)
  // null = not touched yet, so the toggle shows the saved choice
  const [mediaPick, setMediaPick] = useState<boolean | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const textId = useId()
  const panelId = useId()

  useEffect(
    () =>
      onConsentSettingsRequested(() => {
        returnTo.current = document.activeElement as HTMLElement | null
        setReopened(true)
        setCustom(true)
      }),
    []
  )

  const open = ready && (!decided || reopened)

  // Opening the settings on purpose moves focus into the banner; the first-visit banner doesn't steal it.
  useEffect(() => {
    if (open && reopened) box.current?.focus()
  }, [open, reopened])

  if (!open) return null
  const mediaOn = mediaPick ?? media

  function close(pick: () => void) {
    pick()
    setReopened(false)
    setCustom(false)
    setMediaPick(null)
    returnTo.current?.focus?.()
    returnTo.current = null
  }

  return (
    <div
      ref={box}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={textId}
      tabIndex={-1}
      onKeyDown={(e) => {
        // Escape only dismisses when there is already a saved choice to fall back on.
        if (e.key === 'Escape' && decided) close(() => {})
      }}
      style={{ bottom: 'calc(var(--player-offset, 0px) + 16px)', animation: 'fadeUp 0.35s ease both' }}
      className="no-print fixed inset-x-4 z-[115] max-h-[calc(100dvh-120px)] overflow-y-auto rounded-[24px] border border-line bg-ink p-5 text-ivory shadow-[0_24px_60px_rgba(0,0,0,0.45)] focus:outline-none sm:p-6 md:right-auto md:left-6 md:w-[520px]"
    >
      <h2 id={titleId} className="font-display text-2xl leading-tight text-ivory">
        Cookies on this site
      </h2>
      <p id={textId} className="mt-2 font-body text-[15px] leading-relaxed text-ivory/75">
        We use essential cookies to keep the site secure and working. With your permission we also load YouTube videos and
        Google Maps, which set their own cookies.{' '}
        <Link href="/cookies" className="font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
          Cookie policy
        </Link>
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <button type="button" className={choice} onClick={() => close(acceptAll)}>
          Accept all
        </button>
        <button type="button" className={choice} onClick={() => close(rejectAll)}>
          Reject non-essential
        </button>
        <button type="button" className={choice} onClick={() => setCustom((v) => !v)} aria-expanded={custom} aria-controls={panelId}>
          Customise
        </button>
      </div>

      {custom && (
        <fieldset id={panelId} className="mt-5 space-y-3 border-t border-line pt-5">
          <legend className="sr-only">Choose which cookies to allow</legend>
          <Toggle
            id="consent-essential"
            label="Essential"
            text="Security, sign-in for staff and your choices on this site. Always on."
            checked
            disabled
          />
          <Toggle
            id="consent-media"
            label="Media embeds"
            text="YouTube videos and Google Maps. Google may set cookies and see your IP address when these load."
            checked={mediaOn}
            onChange={setMediaPick}
          />
          <button type="button" className={cn(choice, 'mt-2 w-full sm:w-auto')} onClick={() => close(() => save({ media: mediaOn }))}>
            Save choices
          </button>
        </fieldset>
      )}
    </div>
  )
}

function Toggle({
  id,
  label,
  text,
  checked,
  disabled,
  onChange,
}: {
  id: string
  label: string
  text: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0">
        <span className="block font-body text-[15px] font-semibold text-ivory">{label}</span>
        <span className="mt-0.5 block font-body text-sm leading-snug text-ivory/60">{text}</span>
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60',
          checked ? 'border-gold bg-gold' : 'border-line bg-night'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-[left]',
            checked ? 'left-[calc(100%-24px)] bg-night' : 'left-[3px] bg-ivory/70'
          )}
        />
      </button>
    </div>
  )
}
