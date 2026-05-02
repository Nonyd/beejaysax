'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', emoji: '▦' },
  { href: '/admin/events', label: 'Events', emoji: '◈' },
  { href: '/admin/releases', label: 'Releases', emoji: '♪' },
  { href: '/admin/gallery', label: 'Gallery', emoji: '▣' },
  { href: '/admin/messages', label: 'Messages', emoji: '✉' },
]

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 flex h-screen flex-col border-r border-[#1E1E1E] bg-[#0A0A0A]"
      style={{ width: 256, zIndex: 40 }}
    >
      <div className="border-b border-[#1E1E1E] p-6">
        <div className="flex items-center gap-2">
          <div>
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
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                fontStyle: 'italic',
                color: '#C9A84C',
              }}
            >
              {' '}
              SAX
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '2px 6px',
            }}
          >
            ADMIN
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
            style={{
              color: isActive(item.href) ? '#C9A84C' : '#555',
              background: isActive(item.href) ? 'rgba(201,168,76,0.08)' : 'transparent',
              borderLeft: isActive(item.href) ? '2px solid #C9A84C' : '2px solid transparent',
              paddingLeft: isActive(item.href) ? 10 : 12,
            }}
          >
            <span style={{ fontSize: 14 }}>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#1E1E1E] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex items-center justify-center text-xs font-bold"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#C9A84C',
              color: '#080808',
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: '#F5F0E8' }}>{username}</span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="mb-3 w-full border border-[#2A2A2A] py-2 text-[#555] transition hover:border-[#555] hover:text-white"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Sign Out
        </button>
        <Link
          href="/"
          className="block text-center text-[#333] transition hover:text-[#C9A84C]"
          style={{ fontSize: 11 }}
        >
          ← View site
        </Link>
      </div>
    </aside>
  )
}
