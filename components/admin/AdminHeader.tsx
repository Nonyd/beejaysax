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
      className="flex items-center justify-between border-b border-[#1E1E1E] bg-[#0A0A0A] px-8"
      style={{ height: 64 }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          color: '#F5F0E8',
          fontWeight: 600,
        }}
      >
        {title}
      </h1>
      <span style={{ fontSize: 12, color: '#333' }}>{today}</span>
    </header>
  )
}
