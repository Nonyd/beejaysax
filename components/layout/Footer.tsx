import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/releases', label: 'Releases' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function IconSpotify({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.399.119-.78-.12-.9-.48-.12-.42.12-.78.48-.899 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V8.3a6.34 6.34 0 1 0 4.87 6.17V9.07a7.88 7.88 0 0 0 4.77 1.59V7.1a4.82 4.82 0 0 1-1.53-.41z" />
    </svg>
  )
}

const social = [
  { href: 'https://www.instagram.com', label: 'Instagram', Icon: IconInstagram },
  { href: 'https://www.youtube.com', label: 'YouTube', Icon: IconYoutube },
  { href: 'https://www.facebook.com', label: 'Facebook', Icon: IconFacebook },
  { href: 'https://open.spotify.com', label: 'Spotify', Icon: IconSpotify },
  { href: 'https://www.tiktok.com', label: 'TikTok', Icon: IconTikTok },
] as const

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-bjs-border bg-bjs-black">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:px-8 lg:px-12">
        <div className="border-b border-bjs-border pb-16 text-center">
          <p className="font-sans text-[13px] font-bold uppercase tracking-[0.3em] text-bjs-white">
            BEEJAY
            <span className="font-serif text-[14px] font-normal italic tracking-normal text-bjs-gold"> Sax</span>
          </p>
          <p className="mt-4 font-serif text-lg italic text-bjs-gold/60">Blessed & Highly Favoured.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {social.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center border border-bjs-border text-bjs-muted transition-all duration-200 hover:border-bjs-gold hover:text-bjs-gold"
              >
                <Icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-[10px] uppercase tracking-wide text-bjs-muted md:justify-start">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors duration-200 hover:text-bjs-white">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bjs-border pt-8 font-sans text-[10px] text-[#2A2A2A] sm:flex-row">
          <p>
            © {year} BeeJay Sax
          </p>
          <p>
            Built by{' '}
            <Link
              href="https://sonshubmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-bjs-gold"
            >
              SonsHub Media
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
