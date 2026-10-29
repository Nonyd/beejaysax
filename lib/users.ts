// Server-only: Admin → Users. Super admins create accounts and choose what each one can do.
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isPermission, type Role } from '@/lib/permissions'

export class UserError extends Error {}

const SELECT = {
  id: true,
  username: true,
  email: true,
  name: true,
  role: true,
  permissions: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
} as const

export type AdminUserView = {
  id: string
  username: string
  email: string
  name: string | null
  role: string
  permissions: string[]
  active: boolean
  lastLoginAt: string | null
  createdAt: string
}

export async function listUsers(): Promise<AdminUserView[]> {
  const users = await prisma.adminUser.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } })
  return users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }))
}

export type UserInput = {
  username?: unknown
  email?: unknown
  name?: unknown
  password?: unknown
  role?: unknown
  permissions?: unknown
  active?: unknown
}

function clean(input: UserInput, creating: boolean) {
  const out: {
    username?: string
    email?: string
    name?: string | null
    password?: string
    role?: Role
    permissions?: string[]
    active?: boolean
  } = {}

  if (creating || input.username !== undefined) {
    const username = String(input.username ?? '').trim().toLowerCase()
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new UserError('Username must be 3–32 characters: letters, numbers, dots, dashes or underscores.')
    }
    out.username = username
  }
  if (creating || input.email !== undefined) {
    const email = String(input.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError('Enter a valid email address.')
    out.email = email
  }
  if (input.name !== undefined) out.name = String(input.name ?? '').trim().slice(0, 80) || null
  if (creating || (input.password !== undefined && input.password !== '')) {
    const password = String(input.password ?? '')
    if (password.length < 10) throw new UserError('Password must be at least 10 characters.')
    out.password = password
  }
  if (creating || input.role !== undefined) {
    if (input.role !== 'SUPER_ADMIN' && input.role !== 'STAFF') throw new UserError('Choose a role.')
    out.role = input.role
  }
  if (creating || input.permissions !== undefined) {
    const list = Array.isArray(input.permissions) ? input.permissions.map(String) : []
    out.permissions = [...new Set(list.filter(isPermission))]
  }
  if (input.active !== undefined) out.active = Boolean(input.active)

  if (out.role === 'STAFF' && out.permissions && out.permissions.length === 0) {
    throw new UserError('Tick at least one section this person can use.')
  }
  return out
}

async function assertUnique(username?: string, email?: string, exceptId?: string) {
  if (!username && !email) return
  const clash = await prisma.adminUser.findFirst({
    where: {
      OR: [username ? { username } : {}, email ? { email } : {}].filter((c) => Object.keys(c).length),
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    select: { username: true, email: true },
  })
  if (clash) throw new UserError(clash.username === username ? 'That username is taken.' : 'Another user already has that email.')
}

export async function createUser(input: UserInput) {
  const data = clean(input, true)
  await assertUnique(data.username, data.email)
  await prisma.adminUser.create({
    data: {
      username: data.username!,
      email: data.email!,
      name: data.name ?? null,
      passwordHash: await hash(data.password!, 12),
      role: data.role!,
      permissions: data.role === 'SUPER_ADMIN' ? [] : data.permissions!,
      active: data.active ?? true,
    },
  })
}

/** There must always be at least one active super admin, or nobody could manage users. */
async function otherActiveSuperAdmins(id: string) {
  return prisma.adminUser.count({ where: { role: 'SUPER_ADMIN', active: true, NOT: { id } } })
}

export async function updateUser(id: string, input: UserInput, actorId: string) {
  const existing = await prisma.adminUser.findUnique({ where: { id }, select: { role: true, active: true } })
  if (!existing) throw new UserError('That user no longer exists.')
  const data = clean(input, false)

  const losesSuper =
    existing.role === 'SUPER_ADMIN' && existing.active && (data.role === 'STAFF' || data.active === false)
  if (losesSuper) {
    if (id === actorId) throw new UserError('You cannot remove your own super admin access or disable yourself.')
    if ((await otherActiveSuperAdmins(id)) === 0) throw new UserError('Keep at least one active super admin.')
  }
  const role = data.role ?? existing.role

  await assertUnique(data.username, data.email, id)
  await prisma.adminUser.update({
    where: { id },
    data: {
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role,
      permissions: role === 'SUPER_ADMIN' ? [] : data.permissions,
      active: data.active,
      ...(data.password ? { passwordHash: await hash(data.password, 12) } : {}),
    },
  })
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw new UserError('You cannot delete your own account.')
  const existing = await prisma.adminUser.findUnique({ where: { id }, select: { role: true, active: true } })
  if (!existing) return
  if (existing.role === 'SUPER_ADMIN' && existing.active && (await otherActiveSuperAdmins(id)) === 0) {
    throw new UserError('Keep at least one active super admin.')
  }
  await prisma.adminUser.delete({ where: { id } })
}
