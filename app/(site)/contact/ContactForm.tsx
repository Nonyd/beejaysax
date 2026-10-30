'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Loader2, Mail, MapPin, Phone } from 'lucide-react'
import Adire from '@/components/ui/Adire'
import { cn } from '@/lib/utils'
import type { ContentOf } from '@/lib/content/registry'

const INQUIRY = [
  { value: 'BOOKING', label: 'Booking' },
  { value: 'COLLABORATION', label: 'Collaboration' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'GENERAL', label: 'Something else' },
] as const

const label = 'mb-2 block font-body text-sm font-semibold text-ink'
const input =
  'w-full rounded-[14px] border border-ink/20 bg-white/70 px-4 py-3.5 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-clay focus:bg-white'

export default function ContactForm({ content, site }: { content: ContentOf<'contact'>; site: ContentOf<'site'> }) {
  const tel = site.phone.replace(/[^\d+]/g, '')
  const socials = site.socials.filter((s) => /instagram|youtube/i.test(s.label + s.url))
  const searchParams = useSearchParams()
  const initialInquiry = useMemo(() => {
    const q = searchParams.get('inquiry')?.toUpperCase()
    return INQUIRY.some((i) => i.value === q) ? (q as string) : 'GENERAL'
  }, [searchParams])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [inquiryType, setInquiryType] = useState<string>(initialInquiry)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, inquiryType, subject, message, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Your message was not sent. Try again.')
      setToast({ ok: true, text: content.thanks })
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setToast({ ok: false, text: err instanceof Error ? err.message : 'Your message was not sent. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative -mt-[72px] overflow-hidden bg-ink pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.06} />
      <div className="site-shell relative grid gap-14 py-16 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(56px,8vw,112px)] leading-[0.9] tracking-[-0.03em] text-ivory">
            {content.titleLines.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[44ch] font-body text-lg leading-relaxed text-ivory/75">
            {content.intro}
          </p>

          <ul className="mt-12 space-y-5 font-body text-base text-ivory">
            <li className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              {site.location}
            </li>
            <li>
              <a href={`tel:${tel}`} className="flex items-center gap-4 text-ivory no-underline hover:text-gold">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-4 text-ivory no-underline hover:text-gold">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                {site.email}
              </a>
            </li>
          </ul>

          <p className="mt-12 max-w-[44ch] border-l-2 border-gold pl-5 font-body text-base leading-relaxed text-ivory/70">
            {content.note}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {socials.map(({ label: name, url: href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-5 py-2.5 font-body text-sm font-semibold text-ivory/80 no-underline transition-colors hover:border-gold hover:text-gold"
              >
                {name}
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="min-w-0 rounded-[32px] bg-ivory p-6 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
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
          <fieldset>
            <legend className={label}>What is this about?</legend>
            <div className="flex flex-wrap gap-2">
              {INQUIRY.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    'cursor-pointer rounded-full border px-4 py-2 font-body text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay',
                    inquiryType === t.value ? 'border-ink bg-ink text-ivory' : 'border-ink/25 text-ink hover:border-ink'
                  )}
                >
                  <input
                    type="radio"
                    name="inquiryType"
                    value={t.value}
                    checked={inquiryType === t.value}
                    onChange={() => setInquiryType(t.value)}
                    className="sr-only"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-first" className={label}>
                First name
              </label>
              <input id="c-first" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="c-last" className={label}>
                Last name
              </label>
              <input id="c-last" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="c-email" className={label}>
                Email
              </label>
              <input id="c-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="c-phone" className={label}>
                Phone <span className="font-normal text-ink/55">(optional)</span>
              </label>
              <input id="c-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="c-subject" className={label}>
              Subject
            </label>
            <input
              id="c-subject"
              required
              placeholder={inquiryType === 'BOOKING' ? 'e.g. Church anniversary, 14 March 2027' : ''}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={input}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="c-message" className={label}>
              Message
            </label>
            <textarea id="c-message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={cn(input, 'resize-y')} />
          </div>

          {toast && (
            <p
              role="status"
              className={cn(
                'mt-6 rounded-[14px] px-4 py-3 font-body text-sm',
                toast.ok ? 'bg-[#2f6b4f]/10 text-forest' : 'bg-clay/10 text-clay-deep'
              )}
            >
              {toast.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-body text-base font-semibold text-ivory transition-colors hover:bg-night disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Sending' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  )
}
