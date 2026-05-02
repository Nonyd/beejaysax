import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = { title: 'Admin — BeeJay Sax' }

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[#080808] text-white antialiased">
      <AdminSidebar username={session.user?.name ?? session.user?.username ?? 'Admin'} />
      <div className="flex flex-1 flex-col" style={{ marginLeft: 256 }}>
        <AdminHeader />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}
