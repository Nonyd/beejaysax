'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Menu, X } from 'lucide-react'
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

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
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
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power3.out' }
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
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-[400ms] ease-out ${
          scrolled ? 'border-b border-bjs-border bg-bjs-black/95 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="group flex items-baseline gap-0">
            <span className="font-sans text-[13px] font-semibold uppercase tracking-[0.18em] text-bjs-white">
              BEEJAY
            </span>
            <span className="font-serif text-sm italic text-bjs-gold"> SAX</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative font-sans text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    active ? 'text-bjs-gold' : 'text-bjs-white hover:text-bjs-gold'
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-bjs-gold transition-transform duration-300 group-hover:scale-150 ${
                      active ? 'scale-150' : 'scale-0 group-hover:scale-150'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:block">
            <OutlineButton href="/contact?inquiry=booking" size="sm">
              Book BeeJay
            </OutlineButton>
          </div>

          <button
            type="button"
            className="text-bjs-white lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex flex-col bg-bjs-black px-8 pb-10 pt-28 lg:hidden"
        >
          <div className="flex flex-1 flex-col gap-0">
            {LINKS.map((l) => (
              <div key={l.href} className="border-b border-bjs-border py-5 first:pt-0">
                <Link
                  data-mobile-link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-[48px] leading-none text-bjs-white transition-colors hover:text-bjs-gold"
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-6 border-t border-bjs-border pt-8">
            <div className="flex justify-center gap-6 text-bjs-muted">
              <Link href="https://www.instagram.com" className="hover:text-bjs-gold" target="_blank" rel="noopener noreferrer">
                IG
              </Link>
              <Link href="https://www.youtube.com" className="hover:text-bjs-gold" target="_blank" rel="noopener noreferrer">
                YT
              </Link>
            </div>
            <OutlineButton href="/contact?inquiry=booking" size="lg" className="w-full justify-center">
              Book BeeJay
            </OutlineButton>
          </div>
        </div>
      )}
    </>
  )
}
