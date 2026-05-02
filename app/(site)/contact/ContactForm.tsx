'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Loader2, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

const INQUIRY = ['BOOKING', 'COLLABORATION', 'MEDIA', 'GENERAL'] as const

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: 8,
  display: 'block',
}

const inputStyle: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  lineHeight: 1.5,
  color: '#F5F0E8',
  background: '#0F0F0F',
  border: '1px solid #1E1E1E',
  padding: '14px 16px',
  outline: 'none',
  boxSizing: 'border-box',
}

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

  const focusGold = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#C9A84C'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1E1E1E'
  }

  return (
    <div
      className="site-shell grid grid-cols-1 gap-16 py-24 lg:grid-cols-2 lg:gap-16"
      style={{ paddingTop: 80 }}
    >
      <div>
        <p style={labelStyle}>Reach Out</p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(48px,7vw,88px)',
            fontWeight: 700,
            lineHeight: 0.92,
            color: '#F5F0E8',
            margin: '0 0 24px',
          }}
        >
          <span style={{ display: 'block' }}>Let&apos;s Talk.</span>
        </h1>
        <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 32 }} />

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                display: 'flex',
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #1E1E1E',
                flexShrink: 0,
              }}
            >
              <MapPin style={{ width: 14, height: 14, color: '#C9A84C' }} aria-hidden />
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#F5F0E8' }}>Lagos, Nigeria</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                display: 'flex',
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #1E1E1E',
                flexShrink: 0,
              }}
            >
              <Phone style={{ width: 14, height: 14, color: '#C9A84C' }} aria-hidden />
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#F5F0E8' }}>+234 80 5898 2828</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                display: 'flex',
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #1E1E1E',
                flexShrink: 0,
              }}
            >
              <Mail style={{ width: 14, height: 14, color: '#C9A84C' }} aria-hidden />
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#F5F0E8' }}>booking@beejaysax.com</span>
          </li>
        </ul>

        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#444',
              textDecoration: 'none',
              border: '1px solid #1E1E1E',
              padding: '10px 16px',
            }}
          >
            Instagram
          </Link>
          <Link
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#444',
              textDecoration: 'none',
              border: '1px solid #1E1E1E',
              padding: '10px 16px',
            }}
          >
            YouTube
          </Link>
        </div>

        <div
          style={{
            marginTop: 40,
            borderLeft: '2px solid #C9A84C',
            background: 'rgba(201,168,76,0.03)',
            padding: '16px 20px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.7, color: 'rgba(245,240,232,0.5)', margin: 0 }}>
            For international bookings, include your country, event type, and preferred dates.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label style={{ display: 'block' }}>
            <span style={labelStyle}>First name</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurBorder}
            />
          </label>
          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Last name</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurBorder}
            />
          </label>
        </div>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={focusGold}
            onBlur={blurBorder}
          />
        </label>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={focusGold} onBlur={blurBorder} />
        </label>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Inquiry type</span>
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusGold}
            onBlur={blurBorder}
          >
            {INQUIRY.map((t) => (
              <option key={t} value={t}>
                {t === 'MEDIA' ? 'Media / Press' : t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} onFocus={focusGold} onBlur={blurBorder} />
        </label>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            style={{ ...inputStyle, minHeight: 160, resize: 'none' }}
            onFocus={focusGold}
            onBlur={blurBorder}
          />
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={submit}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            width: '100%',
            padding: '16px 24px',
            background: '#C9A84C',
            color: '#080808',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite', display: 'inline-block' }} aria-hidden />
              Sending…
            </span>
          ) : (
            'Send Message'
          )}
        </button>

        {toast && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: toast.ok ? '#4ade80' : '#f87171', margin: 0 }}>
            {toast.text}
          </p>
        )}
      </div>
    </div>
  )
}
