import AdminPageHeader from '@/components/admin/AdminPageHeader'
import UsersClient from '@/components/admin/UsersClient'
import { requireAdmin } from '@/lib/admin-auth'
import { listUsers } from '@/lib/users'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const admin = await requireAdmin('users')
  return (
    <div>
      <AdminPageHeader
        eyebrow="Access"
        title="Users"
        subtitle="Add people to the admin and choose which sections each one can use. Changes apply straight away, even to someone already signed in."
      />
      <UsersClient initial={await listUsers()} currentUserId={admin.id} />
    </div>
  )
}
