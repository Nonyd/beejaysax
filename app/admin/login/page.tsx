'use client'

import { Wordmark } from '@/components/layout/Navbar'
import { useState, Suspense } from 'react'
import type { CSSProperties } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const labelStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: '#E3B23C',
  display: 'block',
  marginBottom: 8,
}

const inputStyle: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: '#F7F1E3',
  background: '#1B1F4B',
  border: '1px solid rgba(247,241,227,0.12)',
  padding: '14px 16px',
  outline: 'none',
  boxSizing: 'border-box',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!username || !password) return
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl,
    })
    if (result?.error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const focusGold = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E3B23C'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(247,241,227,0.12)'
  }

  return (
    <div
      className="admin-ui flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background: '#11142F',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(227,178,60,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(227,178,60,0.06) 0%, transparent 45%)',
      }}
    >
      <div
        className="w-full max-w-[420px]"
        style={{
          border: '1px solid rgba(247,241,227,0.2)',
          background: 'rgba(27,31,75,0.95)',
          boxShadow: '0 32px 120px rgba(0,0,0,0.55)',
          padding: '48px 40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Wordmark className="text-[32px]" />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#E3B23C',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Admin Portal
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(247,241,227,0.65)', textAlign: 'center', marginBottom: 0 }}>
          Sign in to continue
        </p>

        <div style={{ width: 48, height: 2, background: '#E3B23C', margin: '28px auto', opacity: 0.7 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label htmlFor="admin-user" style={labelStyle}>
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurBorder}
            />
          </div>
          <div>
            <label htmlFor="admin-pass" style={labelStyle}>
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
              style={inputStyle}
              onFocus={focusGold}
              onBlur={blurBorder}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontFamily: 'var(--font-sans)', color: '#f87171', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={loading || !username || !password}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            width: '100%',
            marginTop: 28,
            padding: '16px 24px',
            background: '#E3B23C',
            color: '#11142F',
            border: '1px solid rgba(227,178,60,0.5)',
            cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
            opacity: loading || !username || !password ? 0.45 : 1,
            transition: 'opacity 200ms',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'rgba(247,241,227,0.55)',
            textAlign: 'center',
            display: 'block',
            marginTop: 36,
            textDecoration: 'none',
          }}
        >
          ← Back to site
        </Link>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: '#11142F' }} />
      }
    >
      <LoginForm />
    </Suspense>
  )
}
