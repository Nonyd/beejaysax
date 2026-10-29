import { cache } from 'react'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can, type Permission } from '@/lib/permissions'

export type CurrentAdmin = {
  id: string
  username: string
  name: string | null
  email: string
  role: string
  permissions: string[]
}

/**
 * The signed-in admin, read fresh from the database once per request, so role changes,
 * disabled accounts and deleted accounts take effect immediately (not when the JWT expires).
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await auth()
  const id = session?.user?.id
  if (!id) return null
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, email: true, role: true, permissions: true, active: true },
  })
  if (!user || !user.active) return null
  return { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, permissions: user.permissions }
})

/** For admin pages. No session → login; signed in without the permission → dashboard. */
export async function requireAdmin(permission?: Permission) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  if (permission && !can(admin, permission)) redirect('/admin?denied=1')
  return admin
}

/**
 * For admin API routes: returns the admin, or a 401/403 response to return as-is.
 *   const gate = await requireAdminApi('events'); if (gate instanceof NextResponse) return gate
 */
export async function requireAdminApi(permission?: Permission) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
  if (permission && !can(admin, permission)) {
    return NextResponse.json({ error: 'Your account does not have access to this.' }, { status: 403 })
  }
  return admin
}
