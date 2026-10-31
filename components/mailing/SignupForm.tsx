'use client'

import { useState } from 'react'
import Link from 'next/link'

/** "Join the mailing list" form in the footer. Adds the visitor to Admin → Mailing list, tagged "Website signup". */
export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState('')

  if (state === 'done') {
    return (
      <p role="status" className="font-body text-base text-ivory">
        You’re on the list. Watch your inbox for news about the next concert.
      </p>
    )
  }

  return (
    <form
      className="w-full max-w-[460px]"
      onSubmit={async (e) => {
        e.preventDefault()
        setState('busy')
        setError('')
        try {
          const res = await fetch('/api/mailing/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, website }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error ?? 'Couldn’t sign you up just now. Try again.')
          setState('done')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Couldn’t sign you up just now. Try again.')
          setState('idle')
        }
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="signup-email" className="sr-only">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3 font-body text-[15px] text-ivory placeholder:text-ivory/45 focus:border-gold focus:outline-none"
        />
        {/* Hidden from people; bots that fill every field are ignored. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          className="shrink-0 rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-night transition-colors hover:bg-gold-lt disabled:opacity-60"
        >
          {state === 'busy' ? 'Joining…' : 'Join the list'}
        </button>
      </div>
      <p className="mt-3 font-body text-[13px] leading-relaxed text-ivory/50">
        By subscribing you agree to receive emails from BeeJay Sax. Unsubscribe anytime. See our{' '}
        <Link href="/privacy" className="text-ivory/70 underline underline-offset-2 hover:text-gold">
          Privacy Policy
        </Link>
        .
      </p>
      {error && (
        <p role="alert" className="mt-3 font-body text-sm text-gold-lt">
          {error}
        </p>
      )}
    </form>
  )
}
