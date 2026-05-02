'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import GoldButton from '@/components/ui/GoldButton'
import { Loader2, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

const INQUIRY = ['BOOKING', 'COLLABORATION', 'MEDIA', 'GENERAL'] as const

const inputClass =
  'w-full border border-bjs-border bg-bjs-surface px-4 py-3.5 font-sans text-sm text-bjs-white outline-none transition-colors duration-200 placeholder:text-[#2A2A2A] focus:border-bjs-gold'

const labelClass = 'section-label mb-2 block'

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
    <div className="mx-auto grid max-w-6xl gap-16 px-6 py-32 md:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12">
      <div>
        <SectionLabel>Reach Out</SectionLabel>
        <h1 className="h1-text mt-3 text-bjs-white">Let&apos;s Talk.</h1>
        <span className="gold-rule my-8 block" />

        <ul className="space-y-5">
          <li className="flex items-center gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-bjs-border">
              <MapPin className="h-3.5 w-3.5 text-bjs-gold" aria-hidden />
            </span>
            <span className="font-sans text-sm text-bjs-white">Lagos, Nigeria</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-bjs-border">
              <Phone className="h-3.5 w-3.5 text-bjs-gold" aria-hidden />
            </span>
            <span className="font-sans text-sm text-bjs-white">+234 80 5898 2828</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-bjs-border">
              <Mail className="h-3.5 w-3.5 text-bjs-gold" aria-hidden />
            </span>
            <span className="font-sans text-sm text-bjs-white">booking@beejaysax.com</span>
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center border border-bjs-border text-bjs-muted transition-colors hover:border-bjs-gold hover:text-bjs-gold"
            aria-label="Instagram"
          >
            IG
          </Link>
          <Link
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center border border-bjs-border text-bjs-muted transition-colors hover:border-bjs-gold hover:text-bjs-gold"
            aria-label="YouTube"
          >
            YT
          </Link>
        </div>

        <div className="mt-12 border-l-2 border-bjs-gold bg-[rgba(201,168,76,0.03)] px-5 py-4">
          <p className="font-sans text-[13px] leading-[1.7] text-[rgba(245,240,232,0.5)]">
            For international bookings, include your country, event type, and preferred dates.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>First name</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="" />
          </label>
          <label className="block">
            <span className={labelClass}>Last name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="" />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Inquiry type</span>
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className={inputClass}
          >
            {INQUIRY.map((t) => (
              <option key={t} value={t}>
                {t === 'MEDIA' ? 'Media / Press' : t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className={`min-h-[160px] resize-none ${inputClass}`}
          />
        </label>

        <GoldButton type="button" disabled={loading} onClick={submit} className="mt-2 w-full justify-center">
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
