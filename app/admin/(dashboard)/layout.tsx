import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { getCurrentAdmin } from '@/lib/admin-auth'
import { ADMIN_NAV, ROLES, can } from '@/lib/permissions'
import { getMaintenance } from '@/lib/maintenance'

export const metadata = { title: 'Admin — BeeJay Sax' }

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
    <div className="admin-ui min-h-screen antialiased" style={{ background: '#11142F', color: '#F7F1E3' }}>
      <AdminSidebar username={admin.name ?? admin.username} roleLabel={roleLabel} navItems={navItems} width={SIDEBAR_W} />
      <div className="flex flex-col" style={{ marginLeft: SIDEBAR_W, minHeight: '100vh' }}>
        {maintenance.enabled && (
          <div
            className="px-8 py-2.5 text-[13px]"
            style={{ background: 'rgba(240,163,94,0.14)', borderBottom: '1px solid rgba(240,163,94,0.4)', color: '#f0a35e' }}
          >
            Maintenance mode is on: visitors see the maintenance page. You can still browse the site because you are signed in.
          </div>
        )}
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ background: '#11142F' }}>
          <div className="admin-content py-10 pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
