import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = { title: 'Admin — BeeJay Sax' }

const SIDEBAR_W = 280

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/admin/login')

  return (
    <div className="admin-ui min-h-screen antialiased" style={{ background: '#11142F', color: '#F7F1E3' }}>
      <AdminSidebar username={session.user?.name ?? session.user?.username ?? 'Admin'} width={SIDEBAR_W} />
      <div className="flex flex-col" style={{ marginLeft: SIDEBAR_W, minHeight: '100vh' }}>
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ background: '#11142F' }}>
          <div className="admin-content py-10 pb-16">{children}</div>
        </main>
      </div>
    </div>
  )
}
