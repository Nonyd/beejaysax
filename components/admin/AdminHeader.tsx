'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/content': 'Website content',
  '/admin/events': 'Events',
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
    <header
      className="flex min-h-[72px] items-stretch justify-between gap-6"
      style={{
        flexShrink: 0,
        borderBottom: '1px solid color-mix(in srgb, var(--ivory) 12%, transparent)',
        background: 'color-mix(in srgb, var(--night) 92%, transparent)',
        backdropFilter: 'blur(12px)',
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 14,
        paddingBottom: 14,
      }}
    >
      <div className="min-w-0 flex-1">
        <p
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
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px,2.5vw,28px)',
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
        className="hidden shrink-0 sm:block"
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
