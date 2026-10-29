'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UnsubscribeForm({ token, email, initialStatus }: { token: string; email: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function change(action: 'unsubscribe' | 'resubscribe') {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/mailing/unsubscribe?t=${encodeURIComponent(token)}${action === 'resubscribe' ? '&action=resubscribe' : ''}`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'That didn’t work. Try again.')
      setStatus(data.status)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That didn’t work. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const subscribed = status === 'SUBSCRIBED'
  const blocked = status === 'BOUNCED' || status === 'COMPLAINED'

  return (
    <div aria-live="polite">
      <h1 className="font-display text-[clamp(32px,5vw,44px)] leading-[0.95]">
        {subscribed ? 'Unsubscribe from BeeJay Sax emails?' : 'You’re unsubscribed'}
      </h1>
      <p className="mt-4 font-body text-base text-ink/70">
        {subscribed
          ? `${email} will stop getting news about concerts and new music. Ticket emails for events you book are not affected.`
          : `${email} won’t get mailing-list emails from us anymore.`}
      </p>
      {subscribed ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => change('unsubscribe')}
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-ivory disabled:opacity-60"
        >
          {busy ? 'Unsubscribing…' : 'Unsubscribe'}
        </button>
      ) : (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {!blocked && (
            <button
              type="button"
              disabled={busy}
              onClick={() => change('resubscribe')}
              className="inline-flex rounded-full border border-ink/30 px-6 py-3 font-body text-sm font-semibold text-ink disabled:opacity-60"
            >
              {busy ? 'Resubscribing…' : 'Changed your mind? Resubscribe'}
            </button>
          )}
          <Link href="/" className="font-body text-sm font-semibold text-clay-deep">
            Go to the homepage
          </Link>
        </div>
      )}
      {error && <p className="mt-4 font-body text-sm text-clay-deep">{error}</p>}
    </div>
  )
}
