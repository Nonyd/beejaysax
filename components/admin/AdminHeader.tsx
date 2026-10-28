'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/content': 'Website content',
  '/admin/events': 'Events',
  '/admin/releases': 'Releases',
  '/admin/videos': 'Videos',
  '/admin/gallery': 'Gallery',
  '/admin/messages': 'Messages',
  '/admin/emails': 'Emails',
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
        borderBottom: '1px solid rgba(247,241,227,0.12)',
        background: 'rgba(17,20,47,0.92)',
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
            color: '#E3B23C',
            marginBottom: 4,
          }}
        >
          BeeJay Sax
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px,2.5vw,28px)',
            color: '#F7F1E3',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </div>
      <div
        className="hidden shrink-0 sm:block"
        style={{
          alignSelf: 'center',
          borderLeft: '1px solid rgba(247,241,227,0.12)',
          paddingLeft: 24,
          textAlign: 'right',
        }}
      >
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'rgba(247,241,227,0.6)', margin: 0, letterSpacing: '0.06em' }}>
          Today
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,241,227,0.8)', margin: '6px 0 0' }}>{today}</p>
      </div>
    </header>
  )
}
