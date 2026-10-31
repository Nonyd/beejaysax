'use client'

import { Wordmark } from '@/components/layout/Navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Grid2x2 } from 'lucide-react'
import { NAV_ICONS, isNavActive, type AdminNavItem } from '@/components/admin/admin-nav'

export type { AdminNavItem }

export default function AdminSidebar({
  username,
  roleLabel,
  navItems,
  width = 280,
}: {
  username: string
  roleLabel: string
  navItems: AdminNavItem[]
  width?: number
}) {
  const pathname = usePathname()

  const isActive = (href: string) => isNavActive(pathname, href)

  return (
    <aside
      className="fixed left-0 top-0 hidden h-screen flex-col border-r lg:flex"
      style={{
        width,
        zIndex: 40,
        background: 'var(--night-2)',
        borderColor: 'color-mix(in srgb, var(--ivory) 12%, transparent)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: '24px 20px' }}>
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="no-underline" aria-label="Admin dashboard">
            <Wordmark className="h-10" />
          </Link>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              background: 'color-mix(in srgb, var(--gold) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--gold) 35%, transparent)',
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
          const Icon = NAV_ICONS[item.href] ?? Grid2x2
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 2,
                textDecoration: 'none',
                color: active ? 'var(--ivory)' : 'color-mix(in srgb, var(--ivory) 65%, transparent)',
                background: active ? 'color-mix(in srgb, var(--gold) 12%, transparent)' : 'transparent',
                borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
                paddingLeft: active ? 11 : 14,
                transition: 'background 200ms, color 200ms',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden style={{ color: active ? 'var(--gold)' : undefined, flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)', padding: 20 }}>
        <div className="mb-4 flex items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, var(--gold), #C99A2E)',
              color: 'var(--night)',
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
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--ivory)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {username}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'color-mix(in srgb, var(--ivory) 55%, transparent)' }}>{roleLabel}</span>
          </div>
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
            color: 'color-mix(in srgb, var(--ivory) 70%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ivory) 20%, transparent)',
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
            color: 'color-mix(in srgb, var(--ivory) 55%, transparent)',
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
