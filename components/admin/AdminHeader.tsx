'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/events': 'Events',
  '/admin/releases': 'Releases',
  '/admin/gallery': 'Gallery',
  '/admin/messages': 'Messages',
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
      className="flex items-center justify-between"
      style={{
        height: 72,
        flexShrink: 0,
        borderBottom: '1px solid #1E1E1E',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        paddingLeft: 32,
        paddingRight: 32,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 4,
          }}
        >
          BeeJay Sax
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px,2.5vw,28px)',
            color: '#F5F0E8',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#555', margin: 0 }}>Today</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#A8A8A8', margin: '4px 0 0' }}>{today}</p>
      </div>
    </header>
  )
}
