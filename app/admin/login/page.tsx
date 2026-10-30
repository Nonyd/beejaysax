'use client'

import { Wordmark } from '@/components/layout/Navbar'
import { useState, Suspense } from 'react'
import type { CSSProperties } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

const labelStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold)',
  display: 'block',
  marginBottom: 8,
}

const inputStyle: CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ivory)',
  background: 'var(--ink)',
  border: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)',
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
    e.currentTarget.style.borderColor = 'var(--gold)'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--ivory) 12%, transparent)'
  }

  return (
    <div
      className="admin-ui flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background: 'var(--night)',
        backgroundImage:
          'radial-gradient(ellipse 80% 55% at 50% -10%, color-mix(in srgb, var(--gold) 12%, transparent) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, var(--gold) 6%, transparent) 0%, transparent 45%)',
      }}
    >
      <ThemeToggle className="fixed top-5 right-5" />
      <div
        className="w-full max-w-[420px]"
        style={{
          border: '1px solid color-mix(in srgb, var(--ivory) 20%, transparent)',
          background: 'color-mix(in srgb, var(--ink) 95%, transparent)',
          boxShadow: '0 32px 120px rgba(0,0,0,0.55)',
          padding: '48px 40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Wordmark className="h-16" />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Admin Portal
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'color-mix(in srgb, var(--ivory) 65%, transparent)', textAlign: 'center', marginBottom: 0 }}>
          Sign in to continue
        </p>

        <div style={{ width: 48, height: 2, background: 'var(--gold)', margin: '28px auto', opacity: 0.7 }} />

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
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--danger)', fontSize: 14, textAlign: 'center', marginTop: 16 }}>
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
            background: 'var(--gold)',
            color: 'var(--night)',
            border: '1px solid color-mix(in srgb, var(--gold) 50%, transparent)',
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
            color: 'color-mix(in srgb, var(--ivory) 55%, transparent)',
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
        <div className="min-h-screen" style={{ background: 'var(--night)' }} />
      }
    >
      <LoginForm />
    </Suspense>
  )
}
