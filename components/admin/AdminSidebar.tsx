'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/releases', label: 'Releases' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/messages', label: 'Messages' },
]

export default function AdminSidebar({ username, width = 280 }: { username: string; width?: number }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 flex h-screen flex-col border-r"
      style={{
        width,
        zIndex: 40,
        background: '#0A0A0A',
        borderColor: '#1E1E1E',
        boxShadow: '4px 0 40px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ borderBottom: '1px solid #1E1E1E', padding: '24px 20px' }}>
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#F5F0E8',
              }}
            >
              BEEJAY
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 15,
                fontStyle: 'italic',
                color: '#C9A84C',
              }}
            >
              {' '}
              SAX
            </span>
          </Link>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.35)',
              padding: '4px 8px',
            }}
          >
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.06em',
                display: 'block',
                padding: '12px 14px',
                borderRadius: 2,
                textDecoration: 'none',
                color: active ? '#F5F0E8' : '#777',
                background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent',
                paddingLeft: active ? 11 : 14,
                transition: 'background 200ms, color 200ms',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid #1E1E1E', padding: 20 }}>
        <div className="mb-4 flex items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #C9A84C, #a88a3d)',
              color: '#080808',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: '#F5F0E8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {username}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            color: '#888',
            border: '1px solid #2A2A2A',
            cursor: 'pointer',
            marginBottom: 12,
            transition: 'border-color 200ms, color 200ms',
          }}
        >
          Sign Out
        </button>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: '#555',
            textAlign: 'center',
            display: 'block',
            textDecoration: 'none',
            transition: 'color 200ms',
          }}
        >
          ← View public site
        </Link>
      </div>
    </aside>
  )
}
