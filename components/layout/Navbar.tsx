'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Adire from '@/components/ui/Adire'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/releases', label: 'Music' },
  { href: '/videos', label: 'Videos' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-[24px] leading-none tracking-[-0.01em]', className)}>
      <span className="text-ivory">BeeJay</span> <span className="text-gold">Sax</span>
    </span>
  )
}

export default function Navbar({ bookLabel = 'Book BeeJay' }: { bookLabel?: string }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <nav
        className={cn(
          'fixed inset-x-0 top-0 z-[100] flex h-[72px] items-center transition-colors duration-300',
          scrolled || open ? 'border-b border-line bg-night/95 backdrop-blur-md' : 'bg-transparent'
        )}
      >
        <div className="site-shell flex items-center justify-between gap-6">
          <Link href="/" className="no-underline" aria-label="BeeJay Sax home">
            <Wordmark />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = isActive(pathname, l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative py-2 font-body text-[15px] font-medium no-underline transition-colors',
                    active ? 'text-gold' : 'text-ivory/75 hover:text-ivory'
                  )}
                >
                  {l.label}
                  {active && (
                    <span aria-hidden className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-gold" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contact?inquiry=booking"
              className="hidden rounded-full bg-gold px-6 py-2.5 font-body text-sm font-semibold text-night no-underline transition-colors hover:bg-gold-lt lg:inline-flex"
            >
              {bookLabel}
            </Link>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full border border-line lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span
                className={cn('block h-[1.5px] w-5 bg-ivory transition-transform duration-300', open && 'translate-y-[3.75px] rotate-45')}
              />
              <span
                className={cn('block h-[1.5px] w-5 bg-ivory transition-transform duration-300', open && '-translate-y-[3.75px] -rotate-45')}
              />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[99] flex flex-col bg-ink pt-[72px] lg:hidden">
          <Adire variant="field" color="var(--gold)" opacity={0.07} />
          <div className="site-shell relative flex flex-1 flex-col justify-center gap-1">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'font-display text-[44px] leading-[1.15] no-underline',
                  isActive(pathname, l.href) ? 'text-gold' : 'text-ivory'
                )}
                style={{ animation: `fadeUp 0.45s ease ${i * 0.05}s both` }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact?inquiry=booking"
              onClick={() => setOpen(false)}
              className="mt-10 self-start rounded-full bg-gold px-8 py-4 font-body text-base font-semibold text-night no-underline"
            >
              {bookLabel}
            </Link>
          </div>
          <Adire variant="band" color="var(--gold)" opacity={0.6} height={36} />
        </div>
      )}
    </>
  )
}
