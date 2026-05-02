'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4">
      <div className="w-full max-w-sm border border-[#2A2A2A] bg-[#0F0F0F] p-10">
        <div className="text-center">
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#F5F0E8',
            }}
          >
            BEEJAY
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic', color: '#C9A84C' }}>
            {' '}
            SAX
          </span>
        </div>

        <p className="section-label mb-1 mt-8 text-center">Admin Portal</p>
        <p style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Sign in to continue</p>

        <div style={{ width: 48, height: 1, background: '#C9A84C', margin: '24px auto' }} />

        <div className="space-y-4">
          <div>
            <label
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
              className="w-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-white transition-colors focus:border-[#C9A84C] focus:outline-none"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
              className="w-full border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-white transition-colors focus:border-[#C9A84C] focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>
        )}

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={loading || !username || !password}
          className="mt-6 w-full bg-[#C9A84C] py-3.5 font-semibold text-[#080808] transition hover:bg-[#E8C96D] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <a
          href="/"
          style={{ color: '#333', fontSize: 12, textAlign: 'center', display: 'block', marginTop: 32 }}
          className="transition hover:text-white"
        >
          ← Back to site
        </a>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <LoginForm />
    </Suspense>
  )
}
