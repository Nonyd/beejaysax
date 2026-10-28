import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/admin/login')
  }
  return session
}

/**
 * For admin API routes: returns the session, or a 401 response to return as-is.
 *   const gate = await requireAdminApi(); if (gate instanceof NextResponse) return gate
 */
export async function requireAdminApi() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
  return session
}
