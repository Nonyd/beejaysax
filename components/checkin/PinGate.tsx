'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PinGate({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/checkin/${eventId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'That PIN did not work.')
        setPin('')
        return
      }
      router.refresh()
    } catch {
      setError('No connection. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-[360px] text-center">
      <p className="font-body text-sm font-semibold text-gold">Door check-in</p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{eventTitle}</h1>
      <label htmlFor="pin" className="mt-10 block font-body text-ivory/75">
        Enter the check-in PIN from the organiser
      </label>
      <input
        id="pin"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{4,8}"
        maxLength={8}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        className="mt-4 w-full rounded-[16px] border border-line bg-night py-4 text-center font-display text-4xl tracking-[0.4em] text-ivory outline-none focus:border-gold"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'pin-error' : undefined}
      />
      {error && (
        <p id="pin-error" role="alert" className="mt-3 font-body text-sm text-[#f0a35e]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || pin.length < 4}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 font-body font-semibold text-night disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Start check-in
      </button>
    </form>
  )
}
