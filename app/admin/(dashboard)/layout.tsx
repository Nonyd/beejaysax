import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminMobileNav from '@/components/admin/AdminMobileNav'
import type { Viewport } from 'next'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { ADMIN_NAV, ROLES, can } from '@/lib/permissions'
import { getMaintenance } from '@/lib/maintenance'

export const metadata = { title: 'Admin — BeeJay Sax' }
// Full-bleed on phones so the tab bar can sit in the safe area above the home indicator.
export const viewport: Viewport = { viewportFit: 'cover', themeColor: '#11142f' }

const SIDEBAR_W = 280

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const navItems = ADMIN_NAV.filter((item) => !item.permission || can(admin, item.permission)).map(({ href, label }) => ({
    href,
    label,
  }))
  const roleLabel = ROLES.find((r) => r.value === admin.role)?.label ?? admin.role
  const maintenance = await getMaintenance()

  return (
    <div className="admin-ui min-h-screen antialiased" style={{ background: 'var(--night)', color: 'var(--ivory)' }}>
      <AdminSidebar username={admin.name ?? admin.username} roleLabel={roleLabel} navItems={navItems} width={SIDEBAR_W} />
      <AdminMobileNav navItems={navItems} username={admin.name ?? admin.username} roleLabel={roleLabel} />
      {/* The sidebar is desktop only; on phones the content uses the full width. */}
      <div className="flex min-h-screen flex-col lg:ml-[var(--sidebar-w)]" style={{ ['--sidebar-w' as string]: `${SIDEBAR_W}px` }}>
        {maintenance.enabled && (
          <div
            className="px-4 py-2.5 text-[13px] lg:px-8"
            style={{ background: 'color-mix(in srgb, var(--warn) 14%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--warn) 40%, transparent)', color: 'var(--warn)' }}
          >
            Maintenance mode is on: visitors see the maintenance page. You can still browse the site because you are signed in.
          </div>
        )}
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ background: 'var(--night)' }}>
          <div className="admin-content admin-main py-6 lg:py-10 lg:pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
