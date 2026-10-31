'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ExternalLink, Grid2x2, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ICONS, SHORT_LABELS, isNavActive, splitTabs, type AdminNavItem } from '@/components/admin/admin-nav'

/**
 * Phone navigation, app style: a bottom tab bar with the most-used sections (door check-in as the
 * raised middle button) and a More sheet with every other section as an icon grid. Hidden from lg up,
 * where the sidebar takes over.
 */
export default function AdminMobileNav({ navItems, username, roleLabel }: { navItems: AdminNavItem[]; username: string; roleLabel: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { tabs, more } = splitTabs(navItems)
  const moreActive = more.some((i) => isNavActive(pathname, i.href))

  // Close the sheet whenever the page changes.
  const [shownFor, setShownFor] = useState(pathname)
  if (shownFor !== pathname) {
    setShownFor(pathname)
    setOpen(false)
  }

  return (
    <>
      <nav
        aria-label="Admin sections"
        className="admin-tabbar fixed inset-x-0 bottom-0 z-50 border-t border-ivory/12 bg-night-2/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex max-w-[560px] items-end justify-around px-1">
          {tabs.map((t) => {
            const Icon = NAV_ICONS[t.href] ?? Grid2x2
            const active = isNavActive(pathname, t.href)
            const label = SHORT_LABELS[t.href] ?? t.label
            if (t.href === '/admin/checkin') {
              return (
                <li key={t.href} className="flex flex-1 justify-center">
                  <Link
                    href={t.href}
                    aria-current={active ? 'page' : undefined}
                    className="tab-link -mt-5 flex flex-col items-center gap-1 pb-2 no-underline"
                  >
                    <span
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-full bg-gold text-night shadow-[0_8px_24px_rgba(0,0,0,0.4)] ring-4 ring-night transition-transform active:scale-95',
                        active && 'bg-gold-lt'
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                    </span>
                    <span className={cn('text-[11px] font-semibold', active ? 'text-gold' : 'text-ivory/70')}>{label}</span>
                  </Link>
                </li>
              )
            }
            return (
              <li key={t.href} className="flex-1">
                <Link href={t.href} aria-current={active ? 'page' : undefined} className="tab-link flex flex-col items-center gap-1 pt-2.5 pb-2 no-underline">
                  <TabIcon Icon={Icon} active={active} />
                  <span className={cn('text-[11px] font-semibold', active ? 'text-gold' : 'text-ivory/65')}>{label}</span>
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="tab-link flex w-full flex-col items-center gap-1 pt-2.5 pb-2"
            >
              <TabIcon Icon={Grid2x2} active={moreActive || open} />
              <span className={cn('text-[11px] font-semibold', moreActive || open ? 'text-gold' : 'text-ivory/65')}>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {open && <MoreSheet items={more} username={username} roleLabel={roleLabel} pathname={pathname} onClose={() => setOpen(false)} />}
    </>
  )
}

function TabIcon({ Icon, active }: { Icon: typeof Grid2x2; active: boolean }) {
  return (
    <span className={cn('flex h-8 w-14 items-center justify-center rounded-full transition-colors', active ? 'bg-gold/15 text-gold' : 'text-ivory/65')}>
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.3 : 1.9} aria-hidden />
    </span>
  )
}

function MoreSheet({
  items,
  username,
  roleLabel,
  pathname,
  onClose,
}: {
  items: AdminNavItem[]
  username: string
  roleLabel: string
  pathname: string
  onClose: () => void
}) {
  const titleId = useId()
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    sheet.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    // Stop the page behind from scrolling while the sheet is open.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Tap outside to close; the close button and Escape cover keyboard users. */}
      <div aria-hidden onClick={onClose} className="admin-sheet-backdrop absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="admin-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] border-t border-ivory/12 bg-ink px-5 pt-3 focus:outline-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ivory/20" aria-hidden />
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-2xl text-ivory">
            All sections
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = NAV_ICONS[item.href] ?? Grid2x2
            const active = isNavActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-full flex-col items-center gap-2 rounded-[20px] border px-2 py-4 text-center no-underline transition-colors active:scale-[0.97]',
                    active ? 'border-gold/50 bg-gold/12' : 'border-ivory/10 bg-night/60'
                  )}
                >
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-[14px]', active ? 'bg-gold text-night' : 'bg-gold/12 text-gold')}>
                    <Icon className="h-[22px] w-[22px]" aria-hidden />
                  </span>
                  <span className="text-[12px] leading-tight font-semibold text-ivory">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 rounded-[20px] border border-ivory/10 bg-night/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-night">{username.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ivory">{username}</p>
              <p className="text-[12px] text-ivory/55">{roleLabel}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/" className="flex items-center justify-center gap-2 rounded-full border border-ivory/15 px-3 py-3 text-ivory no-underline">
              <ExternalLink className="h-4 w-4" aria-hidden /> Public site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center justify-center gap-2 border border-ivory/15 px-3 py-3 text-ivory"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
