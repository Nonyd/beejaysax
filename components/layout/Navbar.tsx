'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import OutlineButton from '@/components/ui/OutlineButton'
import { registerGSAP } from '@/lib/animations'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/releases', label: 'Releases' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const SOCIAL = [
  { href: 'https://www.instagram.com', label: 'Instagram', abbr: 'IG' },
  { href: 'https://www.youtube.com', label: 'YouTube', abbr: 'YT' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    registerGSAP()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-mobile-link]',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.55, ease: 'power3.out', delay: 0.05 }
      )
    }, overlayRef)
    return () => {
      ctx.revert()
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 h-16 w-full transition-all duration-300 ease-out ${
          scrolled
            ? 'border-b border-bjs-border bg-[rgba(8,8,8,0.92)] backdrop-blur-[20px] backdrop-saturate-[180%]'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
          <Link href="/" className="group flex items-baseline gap-0">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-bjs-white">BEEJAY</span>
            <span className="font-serif text-[13px] italic text-bjs-gold"> SAX</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`font-sans text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
                    active ? 'text-bjs-gold' : 'text-[rgba(245,240,232,0.5)] hover:text-bjs-white'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:block">
            <OutlineButton href="/contact?inquiry=booking" size="sm" variant="fill" className="text-[10px] font-semibold tracking-[0.15em]">
              Book BeeJay
            </OutlineButton>
          </div>

          <button
            type="button"
            className="relative z-[110] flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block h-[1.5px] w-5 bg-bjs-white transition-transform duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
            />
            <span className={`block h-[1.5px] w-5 bg-bjs-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span
              className={`block h-[1.5px] w-5 bg-bjs-white transition-transform duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex flex-col bg-bjs-black px-8 pb-10 pt-24 lg:hidden"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-0">
            {LINKS.map((l, i) => (
              <div
                key={l.href}
                className="w-full max-w-md border-b border-bjs-gold/20 py-5 text-center first:pt-0"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Link
                  data-mobile-link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-[clamp(36px,8vw,56px)] italic leading-none text-[rgba(245,240,232,0.5)] transition-colors hover:text-bjs-white"
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-col items-center gap-8 border-t border-bjs-border pt-8">
            <div className="flex justify-center gap-8">
              {SOCIAL.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="font-sans text-xs uppercase tracking-widest text-bjs-muted transition-colors hover:text-bjs-gold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.abbr}
                </Link>
              ))}
            </div>
            <OutlineButton href="/contact?inquiry=booking" size="lg" variant="fill" className="w-full max-w-sm justify-center">
              Book BeeJay
            </OutlineButton>
          </div>
        </div>
      )}
    </>
  )
}
