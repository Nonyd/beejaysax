import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) return NextResponse.next()

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAuthenticated = !!req.auth

  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    const url = new URL('/admin/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
})

export const config = { matcher: ['/admin/:path*'] }
