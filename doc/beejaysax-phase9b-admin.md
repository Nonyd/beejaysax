# 🎷 BEEJAY SAX — Phase 9B: Admin Panel + Auth + QR Scanner
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## CONTEXT

You are continuing the BeeJay Sax website. The repo already has:
- Next.js 16, React 19, Tailwind v4, Prisma 5.22, Neon PostgreSQL
- All public pages built and working
- Phase 9A complete — ticket purchase, QR generation, ticket view page, email via Resend

**YOUR JOB:** Build the complete admin panel in one session. Create every file listed below completely. Do not stop between files. Do not ask for confirmation. Do not explain — just build.

---

## STEP 1 — Run these terminal commands before writing any code

```bash
npm install next-auth@beta bcryptjs @types/bcryptjs
npm install next-cloudinary cloudinary
npm install react-hot-toast
npm install jsqr @types/jsqr
```

---

## STEP 2 — Update prisma/schema.prisma

Add these three models. Do NOT remove anything already in the file:

```prisma
model Account {
  id                String    @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String    @id @default(cuid())
  sessionToken String    @unique
  userId       String
  expires      DateTime
  user         AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

Replace the existing AdminUser model with this (adds relations):

```prisma
model AdminUser {
  id           String    @id @default(cuid())
  username     String    @unique
  email        String    @unique
  passwordHash String
  name         String?
  accounts     Account[]
  sessions     Session[]
  createdAt    DateTime  @default(now())
}
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

---

## STEP 3 — Add to .env.local

```env
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_VERIFY_KEY=same-value-as-ADMIN_VERIFY_KEY
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## STEP 4 — Create all files below completely

---

### `lib/auth.ts`

```ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.username as string },
        })
        if (!admin) return null
        const valid = await compare(credentials.password as string, admin.passwordHash)
        if (!valid) return null
        return { id: admin.id, name: admin.username, email: admin.email }
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string
      return session
    },
  },
})
```

---

### `app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

---

### `middleware.ts`

```ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAuthenticated = !!req.auth

  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
})

export const config = { matcher: ['/admin/:path*'] }
```

---

### `prisma/seed.ts`

Replace the entire file:

```ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@beejaysax.com',
      passwordHash: await hash('BeejaySax2026!', 12),
      name: 'Admin',
    },
  })

  await prisma.event.upsert({
    where: { id: 'seed-event-1' },
    update: {},
    create: {
      id: 'seed-event-1',
      title: 'Beejay Sax Live Concert 2026',
      description: 'The annual gospel event gathering individuals from all walks of life to enjoy ethical, Godly music in a serene atmosphere.',
      venue: 'Eko Hotels and Suites',
      address: 'Plot 1415, Adetokunbo Ademola Street, Victoria Island',
      city: 'Lagos',
      country: 'Nigeria',
      eventDate: new Date('2026-05-24T17:00:00'),
      eventTime: '5:00 PM',
      isFree: false,
      ticketPrice: 5000,
      isFeatured: true,
      status: 'UPCOMING',
    },
  })

  await prisma.release.upsert({
    where: { slug: 'praise-session-1' },
    update: {},
    create: {
      title: 'Praise Session 1',
      slug: 'praise-session-1',
      releaseType: 'ALBUM',
      description: 'A soul-stirring collection of powerful gospel melodies.',
      isFeatured: true,
    },
  })

  await prisma.release.upsert({
    where: { slug: 'modupeoluwa' },
    update: {},
    create: {
      title: 'Modupeoluwa',
      slug: 'modupeoluwa',
      releaseType: 'SINGLE',
      description: 'A beautiful fusion of African rhythms and soulful gospel melodies.',
    },
  })

  await prisma.release.upsert({
    where: { slug: 'joyful-praise' },
    update: {},
    create: {
      title: 'Joyful Praise',
      slug: 'joyful-praise',
      releaseType: 'ALBUM',
      description: 'Pure joy captured in gospel saxophone and song.',
    },
  })

  await prisma.video.upsert({
    where: { id: 'seed-video-1' },
    update: {},
    create: {
      id: 'seed-video-1',
      title: 'BeeJay Sax Live in London, Indigo O2',
      youtubeId: '0jxRD456j_w',
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.video.upsert({
    where: { id: 'seed-video-2' },
    update: {},
    create: {
      id: 'seed-video-2',
      title: 'BeeJay Sax at House on the Rock (TAPE 2022)',
      youtubeId: 'z4saapf2BrA',
      isFeatured: true,
      sortOrder: 2,
    },
  })

  console.log('✅ Seed complete. Admin login: admin / BeejaySax2026!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Run: `npx prisma db seed`

---

### `app/admin/login/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!username || !password) return
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid username or password')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#0F0F0F] border border-[#2A2A2A] p-10">

        {/* Wordmark */}
        <div className="text-center">
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F5F0E8' }}>
            BEEJAY
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic', color: '#C9A84C' }}>
            {' '}SAX
          </span>
        </div>

        <p className="section-label text-center mt-8 mb-1">Admin Portal</p>
        <p style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Sign in to continue</p>

        <div style={{ width: 48, height: 1, background: '#C9A84C', margin: '24px auto' }} />

        <div className="space-y-4">
          <div>
            <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-white text-sm focus:border-[#C9A84C] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-3 text-white text-sm focus:border-[#C9A84C] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          className="mt-6 w-full bg-[#C9A84C] text-[#080808] py-3.5 font-semibold hover:bg-[#E8C96D] transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <a
          href="/"
          style={{ color: '#333', fontSize: 12, textAlign: 'center', display: 'block', marginTop: 32 }}
          className="hover:text-white transition"
        >
          ← Back to site
        </a>
      </div>
    </div>
  )
}
```

---

### `app/admin/layout.tsx`

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'
import { playfair, dmSans } from '@/lib/fonts'
import '../globals.css'

export const metadata = { title: 'Admin — BeeJay Sax' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#080808] text-white font-sans antialiased" suppressHydrationWarning>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0F0F0F', color: '#F5F0E8', border: '1px solid #2A2A2A' },
          }}
        />
        <div className="flex min-h-screen">
          <AdminSidebar username={session.user?.name ?? 'Admin'} />
          <div className="flex-1 flex flex-col" style={{ marginLeft: 256 }}>
            <AdminHeader />
            <main className="flex-1 p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

---

### `components/admin/AdminSidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin',           label: 'Dashboard',  emoji: '▦' },
  { href: '/admin/events',    label: 'Events',     emoji: '◈' },
  { href: '/admin/releases',  label: 'Releases',   emoji: '♪' },
  { href: '/admin/gallery',   label: 'Gallery',    emoji: '▣' },
  { href: '/admin/messages',  label: 'Messages',   emoji: '✉' },
]

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-[#1E1E1E] bg-[#0A0A0A]"
      style={{ width: 256, zIndex: 40 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F5F0E8' }}>BEEJAY</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: '#C9A84C' }}> SAX</span>
          </div>
          <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 6px' }}>
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all"
            style={{
              color: isActive(item.href) ? '#C9A84C' : '#555',
              background: isActive(item.href) ? 'rgba(201,168,76,0.08)' : 'transparent',
              borderLeft: isActive(item.href) ? '2px solid #C9A84C' : '2px solid transparent',
              paddingLeft: isActive(item.href) ? 10 : 12,
            }}
          >
            <span style={{ fontSize: 14 }}>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-6 border-t border-[#1E1E1E]">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center text-xs font-bold"
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#C9A84C', color: '#080808' }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: '#F5F0E8' }}>{username}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full border border-[#2A2A2A] text-[#555] hover:text-white hover:border-[#555] transition py-2 mb-3"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Sign Out
        </button>
        <Link
          href="/"
          className="block text-center text-[#333] hover:text-[#C9A84C] transition"
          style={{ fontSize: 11 }}
        >
          ← View site
        </Link>
      </div>
    </aside>
  )
}
```

---

### `components/admin/AdminHeader.tsx`

```tsx
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

  const title = Object.entries(titles)
    .reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Admin'

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <header
      className="flex items-center justify-between border-b border-[#1E1E1E] bg-[#0A0A0A] px-8"
      style={{ height: 64 }}
    >
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#F5F0E8', fontWeight: 600 }}>
        {title}
      </h1>
      <span style={{ fontSize: 12, color: '#333' }}>{today}</span>
    </header>
  )
}
```

---

### `app/admin/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    upcomingEvents,
    totalTickets,
    usedTickets,
    revenueData,
    releaseCount,
    galleryCount,
    unreadMessages,
    recentTickets,
    recentMessages,
  ] = await Promise.all([
    prisma.event.count({ where: { status: 'UPCOMING' } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { isUsed: true } }),
    prisma.ticket.aggregate({ _sum: { totalAmount: true } }),
    prisma.release.count(),
    prisma.galleryImage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { event: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const totalRevenue = revenueData._sum.totalAmount ?? 0

  const stats = [
    { label: 'Upcoming Events', value: upcomingEvents, sub: 'concerts scheduled' },
    { label: 'Tickets Sold',    value: totalTickets,   sub: `${usedTickets} used at door` },
    { label: 'Total Revenue',   value: `₦${totalRevenue.toLocaleString()}`, sub: 'from ticket sales', isText: true },
    { label: 'Unread Messages', value: unreadMessages,  sub: 'awaiting reply' },
    { label: 'Releases',        value: releaseCount,    sub: 'in discography' },
    { label: 'Gallery Images',  value: galleryCount,    sub: 'uploaded' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#F5F0E8' }}>Welcome back.</h2>
        <p style={{ color: '#555', fontSize: 14, marginTop: 4 }}>Here&apos;s what&apos;s happening with BeeJay Sax.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#0F0F0F] border border-[#1E1E1E] p-6">
            <p className="section-label mb-3">{stat.label}</p>
            <p style={{ fontFamily: stat.isText ? 'var(--font-serif)' : 'var(--font-serif)', fontSize: stat.isText ? 28 : 48, color: '#C9A84C', lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ color: '#444', fontSize: 12, marginTop: 8 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        {[
          { label: '+ New Event',   href: '/admin/events/new',   gold: true },
          { label: '+ New Release', href: '/admin/releases/new', gold: false },
          { label: 'Upload Photos', href: '/admin/gallery',       gold: false },
          { label: 'View Messages', href: '/admin/messages',      gold: false },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="transition"
            style={{
              padding: '10px 20px',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              background: action.gold ? '#C9A84C' : 'transparent',
              color: action.gold ? '#080808' : '#F5F0E8',
              border: action.gold ? 'none' : '1px solid #2A2A2A',
            }}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent tickets */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E]">
          <div className="px-6 py-4 border-b border-[#1E1E1E]">
            <p className="section-label">Recent Registrations</p>
          </div>
          <div className="divide-y divide-[#1E1E1E]">
            {recentTickets.length === 0 && (
              <p className="px-6 py-8 text-[#444] text-sm text-center">No tickets yet</p>
            )}
            {recentTickets.map(ticket => (
              <div key={ticket.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p style={{ fontSize: 14, color: '#F5F0E8' }}>{ticket.firstName} {ticket.lastName}</p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{ticket.event.title}</p>
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px',
                  background: ticket.isUsed ? 'rgba(127,29,29,0.3)' : 'rgba(20,83,45,0.3)',
                  color: ticket.isUsed ? '#f87171' : '#4ade80',
                  border: `1px solid ${ticket.isUsed ? 'rgba(127,29,29,0.5)' : 'rgba(20,83,45,0.5)'}`,
                }}>
                  {ticket.isUsed ? 'Used' : 'Valid'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-[#1E1E1E]">
            <Link href="/admin/events" style={{ fontSize: 12, color: '#C9A84C' }}>View all →</Link>
          </div>
        </div>

        {/* Recent messages */}
        <div className="bg-[#0F0F0F] border border-[#1E1E1E]">
          <div className="px-6 py-4 border-b border-[#1E1E1E]">
            <p className="section-label">Recent Messages</p>
          </div>
          <div className="divide-y divide-[#1E1E1E]">
            {recentMessages.length === 0 && (
              <p className="px-6 py-8 text-[#444] text-sm text-center">No messages yet</p>
            )}
            {recentMessages.map(msg => (
              <div
                key={msg.id}
                className="px-6 py-4"
                style={{ borderLeft: msg.isRead ? 'none' : '2px solid #C9A84C' }}
              >
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: msg.isRead ? 400 : 600 }}>{msg.name}</p>
                  <span style={{ fontSize: 10, color: '#555' }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#555', marginTop: 2 }} className="truncate">{msg.subject}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-[#1E1E1E]">
            <Link href="/admin/messages" style={{ fontSize: 12, color: '#C9A84C' }}>View all →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### `app/api/events/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: 'desc' } })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const event = await prisma.event.create({ data })
  return NextResponse.json(event)
}
```

---

### `app/api/events/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id }, include: { _count: { select: { tickets: true } } } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const event = await prisma.event.update({ where: { id }, data })
  return NextResponse.json(event)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

### `app/api/releases/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const releases = await prisma.release.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(releases)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const release = await prisma.release.create({ data })
  return NextResponse.json(release)
}
```

---

### `app/api/releases/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const release = await prisma.release.update({ where: { id }, data })
  return NextResponse.json(release)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.release.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

### `app/api/gallery/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const image = await prisma.galleryImage.create({ data })
  return NextResponse.json(image)
}
```

---

### `app/api/gallery/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const image = await prisma.galleryImage.update({ where: { id }, data })
  return NextResponse.json(image)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.galleryImage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

### `app/api/upload/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { folder = 'beejaysax' } = await req.json()

  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}
```

---

### `components/admin/AdminFormField.tsx`

```tsx
interface AdminFormFieldProps {
  label: string
  children: React.ReactNode
  optional?: boolean
}

export default function AdminFormField({ label, children, optional }: AdminFormFieldProps) {
  return (
    <div>
      <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>
        {label}
        {optional && <span style={{ color: '#444', marginLeft: 8, letterSpacing: 0, textTransform: 'none', fontSize: 10 }}>(optional)</span>}
      </label>
      {children}
    </div>
  )
}
```

---

### `components/admin/AdminInput.tsx`

```tsx
interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function AdminInput({ className = '', ...props }: AdminInputProps) {
  return (
    <input
      {...props}
      className={`w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none transition-colors placeholder:text-[#333] ${className}`}
    />
  )
}
```

---

### `components/admin/AdminTextarea.tsx`

```tsx
interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function AdminTextarea({ className = '', ...props }: AdminTextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none transition-colors placeholder:text-[#333] resize-none ${className}`}
    />
  )
}
```

---

### `components/admin/AdminSelect.tsx`

```tsx
interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export default function AdminSelect({ options, className = '', ...props }: AdminSelectProps) {
  return (
    <select
      {...props}
      className={`w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none transition-colors ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
```

---

### `components/admin/AdminToggle.tsx`

```tsx
'use client'

interface AdminToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}

export default function AdminToggle({ checked, onChange, label, description }: AdminToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border border-[#2A2A2A] px-4">
      <div>
        <p style={{ fontSize: 13, color: '#F5F0E8' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative transition-colors"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? '#C9A84C' : '#2A2A2A',
          flexShrink: 0,
        }}
      >
        <span
          className="absolute top-1 transition-transform"
          style={{
            width: 16, height: 16, borderRadius: '50%',
            background: checked ? '#080808' : '#555',
            left: 4,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
```

---

### `components/admin/AdminDeleteButton.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AdminDeleteButtonProps {
  endpoint: string
  label?: string
  confirmMessage?: string
}

export default function AdminDeleteButton({
  endpoint,
  label = 'Delete',
  confirmMessage = 'Are you sure you want to delete this? This cannot be undone.',
}: AdminDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deleted successfully')
        router.refresh()
      } else {
        toast.error('Delete failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-900/50 text-red-500 hover:bg-red-900/20 transition px-3 py-1.5 text-xs disabled:opacity-40"
      style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
    >
      {loading ? '...' : label}
    </button>
  )
}
```

---

### `components/admin/EventForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import AdminInput from './AdminInput'
import AdminTextarea from './AdminTextarea'
import AdminSelect from './AdminSelect'
import AdminToggle from './AdminToggle'
import type { Event } from '@prisma/client'

interface EventFormProps {
  mode: 'create' | 'edit'
  event?: Event | null
}

export default function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [address, setAddress] = useState(event?.address ?? '')
  const [city, setCity] = useState(event?.city ?? '')
  const [country, setCountry] = useState(event?.country ?? 'Nigeria')
  const [eventDate, setEventDate] = useState(
    event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : ''
  )
  const [eventTime, setEventTime] = useState(event?.eventTime ?? '')
  const [isFree, setIsFree] = useState(event?.isFree ?? false)
  const [ticketPrice, setTicketPrice] = useState(event?.ticketPrice?.toString() ?? '')
  const [totalTickets, setTotalTickets] = useState(event?.totalTickets?.toString() ?? '')
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured ?? false)
  const [status, setStatus] = useState(event?.status ?? 'UPCOMING')
  const [posterImage, setPosterImage] = useState(event?.posterImage ?? '')

  async function handleSubmit() {
    if (!title || !venue || !city || !eventDate) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title, description, venue, address, city, country,
        eventDate: new Date(eventDate).toISOString(),
        eventTime: eventTime || null,
        isFree,
        ticketPrice: isFree ? null : (ticketPrice ? parseFloat(ticketPrice) : null),
        totalTickets: totalTickets ? parseInt(totalTickets) : null,
        isFeatured,
        status,
        posterImage: posterImage || null,
      }

      const url = mode === 'create' ? '/api/events' : `/api/events/${event!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(mode === 'create' ? 'Event created!' : 'Event updated!')
        router.push('/admin/events')
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Event Details */}
      <section>
        <p className="section-label mb-4">Event Details</p>
        <div className="space-y-4">
          <AdminFormField label="Title *">
            <AdminInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Beejay Sax Live Concert 2026" />
          </AdminFormField>
          <AdminFormField label="Description" optional>
            <AdminTextarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the event..." />
          </AdminFormField>
        </div>
      </section>

      {/* Location */}
      <section>
        <p className="section-label mb-4">Location</p>
        <div className="space-y-4">
          <AdminFormField label="Venue *">
            <AdminInput value={venue} onChange={e => setVenue(e.target.value)} placeholder="Eko Hotels and Suites" />
          </AdminFormField>
          <AdminFormField label="Address" optional>
            <AdminInput value={address} onChange={e => setAddress(e.target.value)} placeholder="Full street address" />
          </AdminFormField>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="City *">
              <AdminInput value={city} onChange={e => setCity(e.target.value)} placeholder="Lagos" />
            </AdminFormField>
            <AdminFormField label="Country">
              <AdminInput value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" />
            </AdminFormField>
          </div>
        </div>
      </section>

      {/* Date & Time */}
      <section>
        <p className="section-label mb-4">Date & Time</p>
        <div className="grid grid-cols-2 gap-4">
          <AdminFormField label="Event Date *">
            <AdminInput type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Event Time" optional>
            <AdminInput type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
          </AdminFormField>
        </div>
      </section>

      {/* Tickets */}
      <section>
        <p className="section-label mb-4">Tickets</p>
        <div className="space-y-4">
          <AdminToggle
            checked={isFree}
            onChange={setIsFree}
            label="Free Event"
            description="Attendees register for free — no payment required"
          />
          {!isFree && (
            <div className="grid grid-cols-2 gap-4">
              <AdminFormField label="Ticket Price (₦)">
                <AdminInput type="number" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} placeholder="5000" min="0" />
              </AdminFormField>
              <AdminFormField label="Total Tickets" optional>
                <AdminInput type="number" value={totalTickets} onChange={e => setTotalTickets(e.target.value)} placeholder="Unlimited" min="1" />
              </AdminFormField>
            </div>
          )}
        </div>
      </section>

      {/* Poster Image */}
      <section>
        <p className="section-label mb-4">Poster Image</p>
        <AdminFormField label="Image URL" optional>
          <AdminInput value={posterImage} onChange={e => setPosterImage(e.target.value)} placeholder="https://res.cloudinary.com/..." />
        </AdminFormField>
        {posterImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterImage} alt="Poster preview" className="mt-3 h-32 object-cover border border-[#2A2A2A]" />
        )}
        <p style={{ fontSize: 12, color: '#444', marginTop: 8 }}>
          Upload image to Cloudinary and paste the URL here. 
          <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', marginLeft: 4 }}>Open Cloudinary →</a>
        </p>
      </section>

      {/* Settings */}
      <section>
        <p className="section-label mb-4">Settings</p>
        <div className="space-y-3">
          <AdminToggle
            checked={isFeatured}
            onChange={setIsFeatured}
            label="Featured Event"
            description="Show this event on the homepage"
          />
          <AdminFormField label="Status">
            <AdminSelect
              value={status}
              onChange={e => setStatus(e.target.value)}
              options={[
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'PAST', label: 'Past' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
          </AdminFormField>
        </div>
      </section>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#1E1E1E]">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#C9A84C] text-[#080808] px-8 py-3 font-semibold hover:bg-[#E8C96D] transition disabled:opacity-40"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.back()}
          className="border border-[#2A2A2A] text-white px-8 py-3 hover:border-[#555] transition"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

---

### `app/admin/events/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: { _count: { select: { tickets: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Events</h2>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage concerts and appearances</p>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-[#C9A84C] text-[#080808] px-6 py-2.5 font-semibold hover:bg-[#E8C96D] transition"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] p-16 text-center">
          <p style={{ color: '#444', fontSize: 14 }}>No events yet.</p>
          <Link href="/admin/events/new" style={{ color: '#C9A84C', fontSize: 13, marginTop: 8, display: 'block' }}>Create your first event →</Link>
        </div>
      ) : (
        <div className="bg-[#0F0F0F] border border-[#1E1E1E] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {['Poster', 'Event', 'Date', 'Venue', 'Tickets', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-[#161616] transition">
                  <td className="px-4 py-3">
                    {event.posterImage ? (
                      <Image src={event.posterImage} alt={event.title} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center text-[#C9A84C]" style={{ width: 48, height: 48, background: '#161616', border: '1px solid #2A2A2A', fontSize: 20 }}>
                        ♪
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 500 }}>{event.title}</p>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{event.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 13, color: '#F5F0E8' }}>{new Date(event.eventDate).toLocaleDateString()}</p>
                    {event.eventTime && <p style={{ fontSize: 11, color: '#555' }}>{event.eventTime}</p>}
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: 13, color: '#888' }}>{event.venue}</td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 14, color: '#C9A84C', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                      {event._count.tickets}
                    </span>
                    {event.totalTickets && <span style={{ fontSize: 12, color: '#444' }}> / {event.totalTickets}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{
                      fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px',
                      background: event.status === 'UPCOMING' ? 'rgba(20,83,45,0.3)' : event.status === 'CANCELLED' ? 'rgba(127,29,29,0.3)' : 'rgba(30,30,30,0.8)',
                      color: event.status === 'UPCOMING' ? '#4ade80' : event.status === 'CANCELLED' ? '#f87171' : '#555',
                      border: `1px solid ${event.status === 'UPCOMING' ? 'rgba(20,83,45,0.5)' : event.status === 'CANCELLED' ? 'rgba(127,29,29,0.5)' : '#2A2A2A'}`,
                    }}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}/edit`} className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition px-3 py-1.5 text-xs" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Edit
                      </Link>
                      <Link href={`/admin/events/${event.id}/tickets`} className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition px-3 py-1.5 text-xs" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Tickets
                      </Link>
                      <AdminDeleteButton endpoint={`/api/events/${event.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

---

### `app/admin/events/new/page.tsx`

```tsx
import EventForm from '@/components/admin/EventForm'

export default function NewEventPage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>New Event</h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>Add a new concert or appearance</p>
      <EventForm mode="create" />
    </div>
  )
}
```

---

### `app/admin/events/[id]/edit/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventForm from '@/components/admin/EventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>Edit Event</h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>{event.title}</p>
      <EventForm mode="edit" event={JSON.parse(JSON.stringify(event))} />
    </div>
  )
}
```

---

### `app/admin/events/[id]/tickets/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QRScanner from '@/components/admin/QRScanner'
import TicketListClient from '@/components/admin/TicketListClient'

export default async function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const tickets = await prisma.ticket.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
  })

  const usedCount = tickets.filter(t => t.isUsed).length
  const totalRevenue = tickets.reduce((sum, t) => sum + (t.totalAmount ?? 0), 0)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/events" style={{ color: '#555', fontSize: 13 }}>← Events</Link>
        <span style={{ color: '#2A2A2A' }}>/</span>
        <span style={{ color: '#F5F0E8', fontSize: 13 }}>{event.title}</span>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 24 }}>
        Tickets & Scanner
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Registered',   value: tickets.length },
          { label: 'Admitted',     value: usedCount },
          { label: 'Remaining',    value: tickets.length - usedCount },
          { label: 'Revenue',      value: `₦${totalRevenue.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0F0F0F] border border-[#1E1E1E] p-4">
            <p className="section-label mb-2">{stat.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: '#C9A84C', lineHeight: 1 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <TicketListClient tickets={JSON.parse(JSON.stringify(tickets))} eventId={id} />
      <div className="mt-8">
        <QRScanner />
      </div>
    </div>
  )
}
```

---

### `components/admin/TicketListClient.tsx`

```tsx
'use client'

import { useState } from 'react'

interface Ticket {
  id: string
  ticketNumber: string
  firstName: string
  lastName: string
  email: string
  ticketType: string
  quantity: number
  totalAmount: number
  isUsed: boolean
  createdAt: string
}

export default function TicketListClient({ tickets, eventId }: { tickets: Ticket[], eventId: string }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'list' | 'scanner'>('list')

  const filtered = tickets.filter(t =>
    `${t.firstName} ${t.lastName} ${t.email} ${t.ticketNumber}`.toLowerCase().includes(search.toLowerCase())
  )

  function exportCSV() {
    const headers = ['Ticket #', 'Name', 'Email', 'Type', 'Qty', 'Amount', 'Status', 'Date']
    const rows = tickets.map(t => [
      t.ticketNumber,
      `${t.firstName} ${t.lastName}`,
      t.email,
      t.ticketType,
      t.quantity,
      t.totalAmount,
      t.isUsed ? 'Used' : 'Valid',
      new Date(t.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-${eventId}.csv`
    a.click()
  }

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-0 mb-6 border border-[#2A2A2A] inline-flex">
        {(['list', 'scanner'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-6 py-2.5 transition"
            style={{
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
              background: activeTab === tab ? '#C9A84C' : 'transparent',
              color: activeTab === tab ? '#080808' : '#555',
            }}
          >
            {tab === 'list' ? 'Ticket List' : 'QR Scanner'}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div>
          <div className="flex gap-3 mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or ticket number..."
              className="flex-1 bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
            />
            <button
              onClick={exportCSV}
              className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] transition px-4 py-2.5 text-xs"
              style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Export CSV
            </button>
          </div>

          <div className="bg-[#0F0F0F] border border-[#1E1E1E] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  {['Ticket #', 'Name', 'Email', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]">
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-[#161616] transition">
                    <td className="px-4 py-3" style={{ fontSize: 12, color: '#C9A84C', fontFamily: 'monospace' }}>{ticket.ticketNumber}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: '#F5F0E8' }}>{ticket.firstName} {ticket.lastName}</td>
                    <td className="px-4 py-3" style={{ fontSize: 12, color: '#888' }}>{ticket.email}</td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9A84C', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 6px' }}>
                        {ticket.ticketType}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: '#F5F0E8' }}>
                      {ticket.totalAmount === 0 ? 'Free' : `₦${ticket.totalAmount.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3">
                      <span style={{
                        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px',
                        background: ticket.isUsed ? 'rgba(127,29,29,0.3)' : 'rgba(20,83,45,0.3)',
                        color: ticket.isUsed ? '#f87171' : '#4ade80',
                        border: `1px solid ${ticket.isUsed ? 'rgba(127,29,29,0.5)' : 'rgba(20,83,45,0.5)'}`,
                      }}>
                        {ticket.isUsed ? 'Used' : 'Valid'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 12, color: '#555' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#444', fontSize: 13 }}>No tickets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### `components/admin/QRScanner.tsx`

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'

type ScanState = 'idle' | 'scanning' | 'success' | 'used' | 'error'

interface ScanResult {
  attendee?: string
  ticketType?: string
  ticketNumber?: string
  eventTitle?: string
  usedAt?: string
  reason?: string
}

export default function QRScanner() {
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult>({})
  const [cameraError, setCameraError] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [countdown, setCountdown] = useState(3)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)

  const verifyToken = useCallback(async (url: string) => {
    const parts = url.split('/')
    const token = parts[parts.length - 1]
    if (!token || token.length < 10) {
      setScanState('error')
      setResult({ reason: 'Invalid QR code format' })
      return
    }

    try {
      const res = await fetch(`/api/tickets/${token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY }),
      })
      const data = await res.json()

      if (data.valid) {
        setScanState('success')
        setResult(data)
      } else if (data.reason === 'already_used') {
        setScanState('used')
        setResult(data)
      } else {
        setScanState('error')
        setResult({ reason: data.error ?? 'Invalid ticket' })
      }
    } catch {
      setScanState('error')
      setResult({ reason: 'Network error — check connection' })
    }
  }, [])

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code?.data) {
      stopCamera()
      verifyToken(code.data)
    } else {
      animFrameRef.current = requestAnimationFrame(scanFrame)
    }
  }, [verifyToken])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setScanState('scanning')
      animFrameRef.current = requestAnimationFrame(scanFrame)
    } catch {
      setCameraError('Camera not available. Use manual entry below.')
      setScanState('idle')
    }
  }

  function stopCamera() {
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function reset() {
    setScanState('idle')
    setResult({})
    setManualToken('')
    setCountdown(3)
  }

  async function handleManualVerify() {
    if (!manualToken.trim()) return
    setScanState('scanning')
    const url = manualToken.includes('/') ? manualToken : `https://beejaysax.com/tickets/${manualToken}`
    await verifyToken(url)
  }

  // Auto-reset countdown after result
  useEffect(() => {
    if (scanState === 'success' || scanState === 'used' || scanState === 'error') {
      setCountdown(3)
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            reset()
            return 3
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [scanState])

  useEffect(() => {
    return () => { stopCamera() }
  }, [])

  return (
    <div className="bg-[#0F0F0F] border border-[#1E1E1E]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <p className="section-label">QR Ticket Scanner</p>
      </div>

      <div className="p-8">

        {/* IDLE */}
        {scanState === 'idle' && (
          <div className="text-center max-w-sm mx-auto">
            <div style={{ fontSize: 64, marginBottom: 16 }}>⬛</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 8 }}>
              Ticket Scanner
            </h3>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 32 }}>
              Point camera at a guest&apos;s QR code to admit them
            </p>

            {cameraError && (
              <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(127,29,29,0.4)', padding: '8px 16px' }}>
                {cameraError}
              </p>
            )}

            <button
              onClick={startCamera}
              className="bg-[#C9A84C] text-[#080808] px-8 py-3 font-semibold hover:bg-[#E8C96D] transition w-full mb-6"
              style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              Start Camera Scanner
            </button>

            <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
              <p style={{ color: '#444', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Or enter ticket token manually
              </p>
              <div className="flex gap-2">
                <input
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualVerify()}
                  placeholder="Paste QR token or URL..."
                  className="flex-1 bg-[#161616] border border-[#2A2A2A] px-3 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
                />
                <button
                  onClick={handleManualVerify}
                  disabled={!manualToken.trim()}
                  className="border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#080808] transition px-4 py-2.5 text-xs disabled:opacity-40"
                  style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCANNING */}
        {scanState === 'scanning' && (
          <div className="text-center">
            <div className="relative inline-block" style={{ width: '100%', maxWidth: 400 }}>
              <video ref={videoRef} className="w-full" style={{ background: '#000' }} playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {/* Corner brackets */}
              {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                <div key={i} className={`absolute ${pos}`} style={{ width: 32, height: 32,
                  borderTop: i < 2 ? '3px solid #C9A84C' : 'none',
                  borderBottom: i >= 2 ? '3px solid #C9A84C' : 'none',
                  borderLeft: i % 2 === 0 ? '3px solid #C9A84C' : 'none',
                  borderRight: i % 2 === 1 ? '3px solid #C9A84C' : 'none',
                }} />
              ))}
            </div>
            <p style={{ color: '#C9A84C', fontSize: 13, marginTop: 16, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Scanning...
            </p>
            <button
              onClick={() => { stopCamera(); setScanState('idle') }}
              className="mt-4 border border-[#2A2A2A] text-[#555] hover:text-white hover:border-[#555] transition px-6 py-2 text-xs"
              style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Stop Scanner
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {scanState === 'success' && (
          <div className="text-center max-w-sm mx-auto py-8">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,83,45,0.3)', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 36 }}>
              ✓
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, color: '#4ade80', margin: '16px 0 8px' }}>ADMIT</h3>
            <p style={{ fontSize: 20, color: '#F5F0E8', fontWeight: 600 }}>{result.attendee}</p>
            <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>{result.ticketType} · {result.ticketNumber}</p>
            <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{result.eventTitle}</p>
            <p style={{ fontSize: 12, color: '#444', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}

        {/* USED */}
        {scanState === 'used' && (
          <div className="text-center max-w-sm mx-auto py-8">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(127,29,29,0.3)', border: '2px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 36 }}>
              ✕
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#f87171', margin: '16px 0 8px' }}>ALREADY ADMITTED</h3>
            <p style={{ fontSize: 16, color: '#F5F0E8' }}>{result.attendee}</p>
            {result.usedAt && <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Admitted at: {new Date(result.usedAt).toLocaleString('en-NG')}</p>}
            <p style={{ fontSize: 12, color: '#444', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}

        {/* ERROR */}
        {scanState === 'error' && (
          <div className="text-center max-w-sm mx-auto py-8">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(120,53,15,0.3)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 36 }}>
              ⚠
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#f59e0b', margin: '16px 0 8px' }}>INVALID TICKET</h3>
            <p style={{ fontSize: 14, color: '#888' }}>{result.reason ?? 'This QR code is not valid'}</p>
            <p style={{ fontSize: 12, color: '#444', marginTop: 24 }}>Next scan in {countdown}...</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### `components/admin/ReleaseForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminFormField from './AdminFormField'
import AdminInput from './AdminInput'
import AdminTextarea from './AdminTextarea'
import AdminSelect from './AdminSelect'
import AdminToggle from './AdminToggle'
import type { Release } from '@prisma/client'

interface ReleaseFormProps {
  mode: 'create' | 'edit'
  release?: Release | null
}

export default function ReleaseForm({ mode, release }: ReleaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(release?.title ?? '')
  const [slug, setSlug] = useState(release?.slug ?? '')
  const [releaseType, setReleaseType] = useState(release?.releaseType ?? 'SINGLE')
  const [description, setDescription] = useState(release?.description ?? '')
  const [coverImage, setCoverImage] = useState(release?.coverImage ?? '')
  const [spotifyUrl, setSpotifyUrl] = useState(release?.spotifyUrl ?? '')
  const [appleMusicUrl, setAppleMusicUrl] = useState(release?.appleMusicUrl ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(release?.youtubeUrl ?? '')
  const [audiomackUrl, setAudiomackUrl] = useState(release?.audiomackUrl ?? '')
  const [boomplayUrl, setBoomplayUrl] = useState(release?.boomplayUrl ?? '')
  const [releaseDate, setReleaseDate] = useState(
    release?.releaseDate ? new Date(release.releaseDate).toISOString().split('T')[0] : ''
  )
  const [isFeatured, setIsFeatured] = useState(release?.isFeatured ?? false)

  function autoSlug(val: string) {
    setTitle(val)
    if (mode === 'create') {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  async function handleSubmit() {
    if (!title || !slug) {
      toast.error('Title and slug are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        title, slug, releaseType, description,
        coverImage: coverImage || null,
        spotifyUrl: spotifyUrl || null,
        appleMusicUrl: appleMusicUrl || null,
        youtubeUrl: youtubeUrl || null,
        audiomackUrl: audiomackUrl || null,
        boomplayUrl: boomplayUrl || null,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
        isFeatured,
      }

      const url = mode === 'create' ? '/api/releases' : `/api/releases/${release!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(mode === 'create' ? 'Release created!' : 'Release updated!')
        router.push('/admin/releases')
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">

      <section>
        <p className="section-label mb-4">Release Details</p>
        <div className="space-y-4">
          <AdminFormField label="Title *">
            <AdminInput value={title} onChange={e => autoSlug(e.target.value)} placeholder="Praise Session 1" />
          </AdminFormField>
          <AdminFormField label="Slug *">
            <AdminInput value={slug} onChange={e => setSlug(e.target.value)} placeholder="praise-session-1" />
          </AdminFormField>
          <AdminFormField label="Type">
            <AdminSelect
              value={releaseType}
              onChange={e => setReleaseType(e.target.value)}
              options={[
                { value: 'SINGLE', label: 'Single' },
                { value: 'ALBUM', label: 'Album' },
                { value: 'EP', label: 'EP' },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="Description" optional>
            <AdminTextarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </AdminFormField>
          <AdminFormField label="Release Date" optional>
            <AdminInput type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
          </AdminFormField>
        </div>
      </section>

      <section>
        <p className="section-label mb-4">Cover Image</p>
        <AdminFormField label="Image URL" optional>
          <AdminInput value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://res.cloudinary.com/..." />
        </AdminFormField>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="Cover preview" className="mt-3 h-32 w-32 object-cover border border-[#2A2A2A]" />
        )}
      </section>

      <section>
        <p className="section-label mb-4">Streaming Links</p>
        <div className="space-y-4">
          {[
            { label: 'Spotify URL', value: spotifyUrl, setter: setSpotifyUrl },
            { label: 'Apple Music URL', value: appleMusicUrl, setter: setAppleMusicUrl },
            { label: 'YouTube URL', value: youtubeUrl, setter: setYoutubeUrl },
            { label: 'Audiomack URL', value: audiomackUrl, setter: setAudiomackUrl },
            { label: 'Boomplay URL', value: boomplayUrl, setter: setBoomplayUrl },
          ].map(field => (
            <AdminFormField key={field.label} label={field.label} optional>
              <AdminInput value={field.value} onChange={e => field.setter(e.target.value)} placeholder="https://..." />
            </AdminFormField>
          ))}
        </div>
      </section>

      <section>
        <p className="section-label mb-4">Settings</p>
        <AdminToggle
          checked={isFeatured}
          onChange={setIsFeatured}
          label="Featured Release"
          description="Show this release on the homepage"
        />
      </section>

      <div className="flex gap-3 pt-4 border-t border-[#1E1E1E]">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#C9A84C] text-[#080808] px-8 py-3 font-semibold hover:bg-[#E8C96D] transition disabled:opacity-40"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Release' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.back()}
          className="border border-[#2A2A2A] text-white px-8 py-3 hover:border-[#555] transition"
          style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
```

---

### `app/admin/releases/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export default async function AdminReleasesPage() {
  const releases = await prisma.release.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Releases</h2>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage discography</p>
        </div>
        <Link href="/admin/releases/new" className="bg-[#C9A84C] text-[#080808] px-6 py-2.5 font-semibold hover:bg-[#E8C96D] transition" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          + New Release
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {releases.map(release => (
          <div key={release.id} className="bg-[#0F0F0F] border border-[#1E1E1E] hover:border-[#C9A84C] transition group">
            <div className="aspect-square relative overflow-hidden bg-[#161616]">
              {release.coverImage ? (
                <Image src={release.coverImage} alt={release.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C9A84C]" style={{ fontSize: 48 }}>♪</div>
              )}
              <span style={{
                position: 'absolute', top: 8, left: 8,
                fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'rgba(201,168,76,0.9)', color: '#080808',
                padding: '2px 6px', fontWeight: 600,
              }}>
                {release.releaseType}
              </span>
              {release.isFeatured && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 9, background: 'rgba(8,8,8,0.8)', color: '#C9A84C',
                  border: '1px solid rgba(201,168,76,0.4)', padding: '2px 6px',
                }}>
                  FEATURED
                </span>
              )}
            </div>
            <div className="p-4">
              <p style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 500 }}>{release.title}</p>
              {release.releaseDate && (
                <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                  {new Date(release.releaseDate).getFullYear()}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Link href={`/admin/releases/${release.id}/edit`} className="border border-[#2A2A2A] text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition px-3 py-1.5 text-xs" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Edit
                </Link>
                <AdminDeleteButton endpoint={`/api/releases/${release.id}`} />
              </div>
            </div>
          </div>
        ))}

        {releases.length === 0 && (
          <div className="col-span-4 bg-[#0F0F0F] border border-[#1E1E1E] p-16 text-center">
            <p style={{ color: '#444', fontSize: 14 }}>No releases yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### `app/admin/releases/new/page.tsx`

```tsx
import ReleaseForm from '@/components/admin/ReleaseForm'

export default function NewReleasePage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>New Release</h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>Add a single, album, or EP</p>
      <ReleaseForm mode="create" />
    </div>
  )
}
```

---

### `app/admin/releases/[id]/edit/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReleaseForm from '@/components/admin/ReleaseForm'

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const release = await prisma.release.findUnique({ where: { id } })
  if (!release) notFound()

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>Edit Release</h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>{release.title}</p>
      <ReleaseForm mode="edit" release={JSON.parse(JSON.stringify(release))} />
    </div>
  )
}
```

---

### `app/admin/gallery/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import GalleryManager from '@/components/admin/GalleryManager'

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Gallery</h2>
        <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Manage photos and media</p>
      </div>
      <GalleryManager initialImages={JSON.parse(JSON.stringify(images))} />
    </div>
  )
}
```

---

### `components/admin/GalleryManager.tsx`

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface GalleryImage {
  id: string
  imagePath: string
  caption: string | null
  category: string
  sortOrder: number
}

const CATEGORIES = ['PERFORMANCE', 'PORTRAIT', 'EVENTS', 'BACKSTAGE']

export default function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('PERFORMANCE')
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? images : images.filter(img => img.category === filter)

  async function handleAddImage() {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    setUploading(true)
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: imageUrl.trim(),
          caption: caption.trim() || null,
          category,
          sortOrder: images.length,
        }),
      })
      if (res.ok) {
        const newImage = await res.json()
        setImages(prev => [...prev, newImage])
        setImageUrl('')
        setCaption('')
        toast.success('Image added!')
      } else {
        toast.error('Failed to add image')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this image?')) return
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setImages(prev => prev.filter(img => img.id !== id))
      toast.success('Image deleted')
    } else {
      toast.error('Delete failed')
    }
  }

  async function handleUpdateCaption(id: string, newCaption: string) {
    await fetch(`/api/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: newCaption }),
    })
  }

  return (
    <div>
      {/* Add image form */}
      <div className="bg-[#0F0F0F] border border-[#1E1E1E] p-6 mb-8">
        <p className="section-label mb-4">Add Image</p>
        <div className="space-y-3">
          <div>
            <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>Image URL *</label>
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>Caption</label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Optional caption..."
                className="w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
              />
            </div>
            <div>
              <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: 6 }}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#161616] border border-[#2A2A2A] px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleAddImage}
            disabled={uploading || !imageUrl.trim()}
            className="bg-[#C9A84C] text-[#080808] px-6 py-2.5 font-semibold hover:bg-[#E8C96D] transition disabled:opacity-40"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            {uploading ? 'Adding...' : 'Add Image'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#333', marginTop: 12 }}>
          Upload to <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C' }}>Cloudinary</a>, then paste the URL above.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-6">
        {['ALL', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-4 py-2 border border-[#2A2A2A] transition"
            style={{
              fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              background: filter === cat ? '#C9A84C' : 'transparent',
              color: filter === cat ? '#080808' : '#555',
              borderRight: cat !== 'BACKSTAGE' ? 'none' : '1px solid #2A2A2A',
            }}
          >
            {cat}
          </button>
        ))}
        <div style={{ borderRight: '1px solid #2A2A2A' }} />
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(image => (
          <div key={image.id} className="group relative bg-[#0F0F0F] border border-[#1E1E1E] hover:border-[#C9A84C] transition">
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={image.imagePath}
                alt={image.caption ?? 'Gallery image'}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="bg-red-900/80 text-white px-3 py-1.5 text-xs hover:bg-red-800 transition"
                  style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="p-3">
              <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', background: 'rgba(201,168,76,0.1)', padding: '1px 6px', border: '1px solid rgba(201,168,76,0.2)' }}>
                {image.category}
              </span>
              <input
                defaultValue={image.caption ?? ''}
                onBlur={e => handleUpdateCaption(image.id, e.target.value)}
                placeholder="Add caption..."
                className="w-full bg-transparent border-none text-[#888] text-xs mt-2 focus:outline-none focus:text-white placeholder:text-[#333]"
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-4 bg-[#0F0F0F] border border-[#1E1E1E] p-12 text-center">
            <p style={{ color: '#444', fontSize: 14 }}>No images in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### `app/admin/messages/page.tsx`

```tsx
import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/admin/MessagesClient'

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Messages</h2>
        <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Contact form submissions</p>
      </div>
      <MessagesClient initialMessages={JSON.parse(JSON.stringify(messages))} />
    </div>
  )
}
```

---

### `components/admin/MessagesClient.tsx`

```tsx
'use client'

import { useState } from 'react'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  inquiryType: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

const INQUIRY_COLORS: Record<string, string> = {
  BOOKING: '#C9A84C',
  COLLABORATION: '#60a5fa',
  MEDIA: '#a78bfa',
  GENERAL: '#888',
}

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)

  async function markRead(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
  }

  async function handleSelect(msg: Message) {
    setSelected(msg)
    if (!msg.isRead) markRead(msg.id)
  }

  const unread = messages.filter(m => !m.isRead).length

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-4 py-2 inline-block">
          <span style={{ fontSize: 12, color: '#C9A84C' }}>{unread} unread message{unread > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="flex gap-0 bg-[#0F0F0F] border border-[#1E1E1E]" style={{ minHeight: 500 }}>

        {/* Message list */}
        <div className="w-80 border-r border-[#1E1E1E] flex-shrink-0 overflow-y-auto">
          {messages.length === 0 && (
            <p className="p-6 text-center" style={{ color: '#444', fontSize: 14 }}>No messages yet</p>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className="px-4 py-4 border-b border-[#1E1E1E] cursor-pointer hover:bg-[#161616] transition"
              style={{
                borderLeft: !msg.isRead ? '2px solid #C9A84C' : '2px solid transparent',
                background: selected?.id === msg.id ? '#161616' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <p style={{ fontSize: 13, color: '#F5F0E8', fontWeight: msg.isRead ? 400 : 600 }}>{msg.name}</p>
                <span style={{ fontSize: 10, color: INQUIRY_COLORS[msg.inquiryType] ?? '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {msg.inquiryType}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#888' }} className="truncate">{msg.subject}</p>
              <p style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
                {new Date(msg.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Message detail */}
        <div className="flex-1 p-8">
          {!selected ? (
            <div className="h-full flex items-center justify-center">
              <p style={{ color: '#333', fontSize: 14 }}>Select a message to read</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#F5F0E8' }}>{selected.subject}</h3>
                  <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                    From: <span style={{ color: '#C9A84C' }}>{selected.name}</span> · {selected.email}
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p style={{ color: '#444', fontSize: 12, marginTop: 2 }}>
                    {new Date(selected.createdAt).toLocaleString('en-NG')}
                  </p>
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: INQUIRY_COLORS[selected.inquiryType] ?? '#888',
                  border: `1px solid ${INQUIRY_COLORS[selected.inquiryType] ?? '#444'}`,
                  padding: '4px 10px',
                }}>
                  {selected.inquiryType}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
                <p style={{ fontSize: 15, color: '#F5F0E8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>

              <div className="mt-8">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="bg-[#C9A84C] text-[#080808] px-6 py-2.5 font-semibold hover:bg-[#E8C96D] transition inline-block"
                  style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### `app/api/messages/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const message = await prisma.contactMessage.update({ where: { id }, data })
  return NextResponse.json(message)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.contactMessage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

---

## STEP 5 — Run seed after all files are created

```bash
npx prisma db seed
```

Default login credentials:
- **Username:** `admin`
- **Password:** `BeejaySax2026!`

Change immediately after first login.

---

## STEP 6 — Test checklist

```
1. npm run dev
2. Visit http://localhost:3000/admin → should redirect to /admin/login
3. Login with admin / BeejaySax2026!
4. Should land on dashboard with stats
5. Test Events: create event, view ticket list, use QR scanner
6. Test Releases: create release, verify it appears on public /releases
7. Test Gallery: add image via URL, verify on public /gallery
8. Test Messages: submit contact form on /contact, verify it appears in admin
9. Sign out → verify redirect to login
10. Try accessing /admin directly without session → verify redirect to login
```

---

## WHAT THIS PHASE DELIVERS

- ✅ NextAuth v5 credentials authentication
- ✅ JWT session strategy
- ✅ Middleware route protection (all /admin routes)
- ✅ Admin login page (styled, no form tags)
- ✅ Admin layout (separate from public site — no Navbar/Footer/Lenis)
- ✅ Sidebar with active state detection
- ✅ Dashboard with live stats + recent activity
- ✅ Events CRUD (create, edit, delete, list with ticket counts)
- ✅ Event ticket list with CSV export + search
- ✅ QR scanner with camera + manual fallback (green/red/orange flash states)
- ✅ Releases CRUD with auto-slug generation
- ✅ Gallery manager (add by URL, delete, caption edit, category filter)
- ✅ Messages inbox with read/unread state + reply via email
- ✅ All REST API routes (events, releases, gallery, messages) — auth protected
- ✅ Cloudinary signed upload endpoint (ready for future direct uploads)
- ✅ react-hot-toast notifications throughout admin

---

*BeeJay Sax Website — Built by SonsHub Media Ltd.*
*Phase 9B complete. Remaining: loading states, error pages, SEO polish (Phase 10).*
