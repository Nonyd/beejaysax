import {
  CalendarDays,
  Clapperboard,
  Construction,
  Disc3,
  Images,
  LayoutDashboard,
  type LucideIcon,
  MailCheck,
  Megaphone,
  MessageSquareText,
  PenLine,
  ScanLine,
  Settings,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'

export type AdminNavItem = { href: string; label: string }

/** One icon per admin section, shared by the desktop sidebar and the phone tab bar. */
export const NAV_ICONS: Record<string, LucideIcon> = {
  '/admin': LayoutDashboard,
  '/admin/content': PenLine,
  '/admin/events': CalendarDays,
  '/admin/revenue': Wallet,
  '/admin/checkin': ScanLine,
  '/admin/releases': Disc3,
  '/admin/videos': Clapperboard,
  '/admin/gallery': Images,
  '/admin/messages': MessageSquareText,
  '/admin/contacts': Users,
  '/admin/campaigns': Megaphone,
  '/admin/emails': MailCheck,
  '/admin/maintenance': Construction,
  '/admin/users': UserCog,
  '/admin/settings': Settings,
}

/** Shorter names where the full label won't fit under a tab icon. */
export const SHORT_LABELS: Record<string, string> = {
  '/admin': 'Home',
  '/admin/checkin': 'Scan',
  '/admin/content': 'Content',
  '/admin/contacts': 'Mailing',
}

export function isNavActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * The phone tab bar: Home plus the three most-used sections the account can open, with door
 * check-in in the middle (it's the one used one-handed at the door). Everything else is under More.
 */
const TAB_PRIORITY = ['/admin/events', '/admin/checkin', '/admin/revenue', '/admin/messages', '/admin/content', '/admin/releases', '/admin/gallery']

export function splitTabs(items: AdminNavItem[]) {
  const available = new Map(items.map((i) => [i.href, i]))
  const picked = TAB_PRIORITY.filter((h) => available.has(h)).slice(0, 3)
  const tabs = [available.get('/admin'), ...picked.map((h) => available.get(h))].filter((i): i is AdminNavItem => Boolean(i))
  // Check-in sits in the middle slot as the raised action button.
  const scanAt = tabs.findIndex((t) => t.href === '/admin/checkin')
  if (scanAt > -1 && tabs.length >= 3) {
    const [scan] = tabs.splice(scanAt, 1)
    tabs.splice(2, 0, scan)
  }
  const inTabs = new Set(tabs.map((t) => t.href))
  return { tabs, more: items.filter((i) => !inTabs.has(i.href)) }
}
