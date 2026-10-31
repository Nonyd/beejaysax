import Link from 'next/link'
import Adire from '@/components/ui/Adire'
import { Wordmark } from '@/components/layout/Navbar'
import { getContent } from '@/lib/content/store'
import SignupForm from '@/components/mailing/SignupForm'
import CookieSettingsButton from '@/components/consent/CookieSettingsButton'

const NAV = [
  { label: 'Music', href: '/releases' },
  { label: 'Videos', href: '/videos' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms', href: '/terms' },
  { label: 'Ticket terms', href: '/ticket-terms' },
]
const legalLink = 'cursor-pointer text-ivory/50 no-underline transition-colors hover:text-gold'

export default async function Footer() {
  const site = await getContent('site')
  return (
    <footer className="bg-night">
      <Adire variant="band" color="var(--gold)" opacity={0.55} height={40} />

      <div className="site-shell">
        <div className="flex flex-col gap-6 border-b border-line pt-16 pb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-[clamp(30px,4vw,42px)] leading-none text-ivory">{site.newsletterTitle}</h2>
            <p className="mt-3 max-w-[46ch] font-body text-base leading-relaxed text-ivory/65">{site.newsletterText}</p>
          </div>
          <SignupForm />
        </div>
      </div>

      <div className="site-shell grid grid-cols-2 gap-x-6 gap-y-12 pt-20 pb-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="no-underline" aria-label="BeeJay Sax home">
            <Wordmark className="h-20" />
          </Link>
          <p className="mt-4 max-w-[34ch] font-body text-base leading-relaxed text-ivory/65">
            {site.footerBlurb}
          </p>
          <Link
            href="/contact?inquiry=booking"
            className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-night no-underline transition-colors hover:bg-gold-lt"
          >
            {site.bookLabel}
          </Link>
        </div>

        <div>
          <p className="mb-4 font-body text-sm font-semibold text-gold">Explore</p>
          <ul className="space-y-2.5">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-body text-[15px] text-ivory/75 no-underline transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-body text-sm font-semibold text-gold">Follow</p>
          <ul className="space-y-2.5">
            {site.socials.map((s) => (
              <li key={s.url || s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[15px] text-ivory/75 no-underline transition-colors hover:text-gold"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-shell">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-6 font-body text-[13px] text-ivory/50 md:flex-row">
          <span>© {new Date().getFullYear()} BeeJay Sax</span>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={legalLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className={legalLink} />
              </li>
            </ul>
          </nav>
          <a href="https://sonshubmedia.com" target="_blank" rel="noopener noreferrer" className="text-ivory/50 no-underline hover:text-gold">
            Built by SonsHub Media
          </a>
        </div>
      </div>
    </footer>
  )
}
