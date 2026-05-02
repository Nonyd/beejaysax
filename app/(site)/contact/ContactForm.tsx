'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import { Loader2 } from 'lucide-react'

const INQUIRY = ['BOOKING', 'COLLABORATION', 'MEDIA', 'GENERAL'] as const

export default function ContactForm() {
  const searchParams = useSearchParams()
  const initialInquiry = useMemo(() => {
    const q = searchParams.get('inquiry')?.toUpperCase()
    if (q === 'BOOKING' || q === 'COLLABORATION' || q === 'MEDIA' || q === 'GENERAL') return q
    return 'GENERAL'
  }, [searchParams])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [inquiryType, setInquiryType] = useState<string>(initialInquiry)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async () => {
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          inquiryType,
          subject,
          message,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to send')
      setToast({ ok: true, text: 'Message sent! We’ll be in touch.' })
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (e) {
      setToast({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-16 px-8 py-24 lg:grid-cols-2">
      <div>
        <SectionLabel>Reach Out</SectionLabel>
        <h1 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">Let&apos;s Talk.</h1>
        <span className="gold-rule my-8 block" />

        <ul className="mt-10 space-y-6 font-sans text-[13px] text-bjs-muted">
          <li>Lagos, Nigeria</li>
          <li>+234 80 5898 2828</li>
          <li>booking@beejaysax.com</li>
        </ul>

        <div className="mt-12 border-l-4 border-bjs-gold bg-bjs-surface px-6 py-4 font-sans text-sm text-bjs-white/80">
          For international bookings and collaborations, kindly include your country, event type, and preferred dates.
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="block">
            <span className="section-label mb-2 block">First name</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
            />
          </label>
          <label className="block">
            <span className="section-label mb-2 block">Last name</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
            />
          </label>
        </div>

        <label className="block">
          <span className="section-label mb-2 block">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
          />
        </label>

        <label className="block">
          <span className="section-label mb-2 block">Phone (optional)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
          />
        </label>

        <label className="block">
          <span className="section-label mb-2 block">Inquiry type</span>
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
          >
            {INQUIRY.map((t) => (
              <option key={t} value={t}>
                {t === 'MEDIA' ? 'Media / Press' : t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="section-label mb-2 block">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
          />
        </label>

        <label className="block">
          <span className="section-label mb-2 block">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="min-h-[180px] w-full border border-bjs-border bg-bjs-surface px-4 py-3 font-sans text-sm text-bjs-white outline-none focus:border-bjs-gold"
          />
        </label>

        <GoldButton type="button" disabled={loading} onClick={submit} className="w-full justify-center">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </span>
          ) : (
            'Send Message'
          )}
        </GoldButton>

        {toast && (
          <p className={`font-sans text-sm ${toast.ok ? 'text-green-400' : 'text-red-400'}`}>{toast.text}</p>
        )}
      </div>
    </div>
  )
}
