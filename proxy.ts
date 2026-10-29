import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getMaintenance, isOpenDuringMaintenance } from '@/lib/maintenance'

// Optimistic checks only: every admin page and API route still checks the account and its
// permissions itself (lib/admin-auth.ts).
export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  if (pathname.startsWith('/admin')) {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
    if (!secret) return NextResponse.next()
    const isLoginPage = pathname === '/admin/login'
    if (!isLoginPage && !isAuthenticated) {
      const url = new URL('/admin/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Maintenance mode: visitors get the maintenance page (503); signed-in admins browse normally.
  if (isOpenDuringMaintenance(pathname)) {
    if (pathname === '/maintenance' && !(await getMaintenance()).enabled) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }
  if (isAuthenticated) return NextResponse.next()
  const maintenance = await getMaintenance()
  if (!maintenance.enabled) return NextResponse.next()

  const headers = { 'Retry-After': '1800', 'Cache-Control': 'no-store' }
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'The site is down for maintenance. Please try again shortly.' },
      { status: 503, headers }
    )
  }
  // A redirect, not a rewrite: auth() rebases req.url on the public site URL, so a rewrite to it would be
  // fetched over the network instead of served internally. The /maintenance page is marked noindex.
  return NextResponse.redirect(new URL('/maintenance', req.url), { status: 307, headers })
})

export const config = {
  // Everything except build assets and files with an extension (images, fonts, robots.txt…)
  matcher: ['/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)'],
}
