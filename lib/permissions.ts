// Shared by server and client code: no database or secret imports here.

export type Role = 'SUPER_ADMIN' | 'STAFF'

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super admin', description: 'Everything, including adding and removing users.' },
  { value: 'STAFF', label: 'Staff', description: 'Only the sections ticked below.' },
]

/**
 * One permission per admin area. A STAFF account sees and can use only the areas it holds;
 * Users is always super-admin only.
 */
export const PERMISSIONS = [
  { key: 'content', label: 'Website content', description: 'Edit page text and images.' },
  { key: 'events', label: 'Events & tickets', description: 'Create events, see sales, comp tickets, coupons, exports and attendee emails.' },
  { key: 'revenue', label: 'Revenue', description: 'See ticket sales, Paystack fees, refunds and net revenue, and export them.' },
  { key: 'checkin', label: 'Door check-in', description: 'Scan tickets at the door. Already included with Events & tickets.' },
  { key: 'releases', label: 'Releases', description: 'Edit releases and run the Spotify sync.' },
  { key: 'videos', label: 'Videos', description: 'Edit videos and run the YouTube sync.' },
  { key: 'gallery', label: 'Gallery', description: 'Upload and arrange photos.' },
  { key: 'messages', label: 'Messages', description: 'Read contact-form messages (includes fan email addresses).' },
  { key: 'mailing', label: 'Mailing list & campaigns', description: 'Manage contacts and send campaigns.' },
  { key: 'emails', label: 'Email log', description: 'See every email sent and retry failures.' },
  { key: 'maintenance', label: 'Maintenance mode', description: 'Take the public site offline and bring it back.' },
  { key: 'settings', label: 'Settings', description: 'Payment, email and sync credentials.' },
] as const

export type Permission = (typeof PERMISSIONS)[number]['key'] | 'users'

const PERMISSION_KEYS = new Set<string>(PERMISSIONS.map((p) => p.key))

export function isPermission(key: string): key is Permission {
  return PERMISSION_KEYS.has(key)
}

export type AdminAccess = { role: string; permissions: string[] }

export function isSuperAdmin(user: AdminAccess) {
  return user.role === 'SUPER_ADMIN'
}

export function can(user: AdminAccess, permission: Permission) {
  if (isSuperAdmin(user)) return true
  if (permission === 'users') return false
  if (permission === 'checkin' && user.permissions.includes('events')) return true
  return user.permissions.includes(permission)
}

/** Admin sidebar, in order. `permission` absent = every signed-in admin. */
export const ADMIN_NAV: { href: string; label: string; permission?: Permission }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Website content', permission: 'content' },
  { href: '/admin/events', label: 'Events', permission: 'events' },
  { href: '/admin/revenue', label: 'Revenue', permission: 'revenue' },
  { href: '/admin/checkin', label: 'Door check-in', permission: 'checkin' },
  { href: '/admin/releases', label: 'Releases', permission: 'releases' },
  { href: '/admin/videos', label: 'Videos', permission: 'videos' },
  { href: '/admin/gallery', label: 'Gallery', permission: 'gallery' },
  { href: '/admin/messages', label: 'Messages', permission: 'messages' },
  { href: '/admin/contacts', label: 'Mailing list', permission: 'mailing' },
  { href: '/admin/campaigns', label: 'Campaigns', permission: 'mailing' },
  { href: '/admin/emails', label: 'Email log', permission: 'emails' },
  { href: '/admin/maintenance', label: 'Maintenance', permission: 'maintenance' },
  { href: '/admin/users', label: 'Users', permission: 'users' },
  { href: '/admin/settings', label: 'Settings', permission: 'settings' },
]
