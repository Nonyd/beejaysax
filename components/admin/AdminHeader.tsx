'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/content': 'Website content',
  '/admin/events': 'Events',
  '/admin/revenue': 'Revenue',
  '/admin/releases': 'Releases',
  '/admin/videos': 'Videos',
  '/admin/gallery': 'Gallery',
  '/admin/messages': 'Messages',
  '/admin/emails': 'Emails',
  '/admin/contacts': 'Mailing list',
  '/admin/campaigns': 'Campaigns',
  '/admin/checkin': 'Door check-in',
  '/admin/maintenance': 'Maintenance',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
}

export default function AdminHeader() {
  const pathname = usePathname()

  const title =
    Object.entries(titles)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin'

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    // On phones this is the app's top bar: sticky, compact, with the brand mark on the left.
    <header
      className="sticky top-0 z-40 flex min-h-[60px] items-center justify-between gap-3 px-4 py-2.5 lg:static lg:min-h-[72px] lg:items-stretch lg:gap-6 lg:px-8 lg:py-3.5"
      style={{
        flexShrink: 0,
        borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)',
        background: 'color-mix(in srgb, var(--night) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
      }}
    >
      <Link
        href="/admin"
        aria-label="Admin dashboard"
        className="shrink-0 no-underline lg:hidden"
      >
        <Image src="/icon.png" alt="" width={40} height={40} className="h-10 w-10 rounded-[12px]" loading="eager" />
      </Link>
      <div className="min-w-0 flex-1">
        <p
          className="hidden lg:block"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: 4,
          }}
        >
          BeeJay Sax
        </p>
        <h1
          className="truncate"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(20px,2.5vw,28px)',
            color: 'var(--ivory)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </div>
      <ThemeToggle className="self-center" />
      <div
        className="hidden shrink-0 lg:block"
        style={{
          alignSelf: 'center',
          borderLeft: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)',
          paddingLeft: 24,
          textAlign: 'right',
        }}
      >
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'color-mix(in srgb, var(--ivory) 60%, transparent)', margin: 0, letterSpacing: '0.06em' }}>
          Today
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'color-mix(in srgb, var(--ivory) 80%, transparent)', margin: '6px 0 0' }}>{today}</p>
      </div>
    </header>
  )
}
