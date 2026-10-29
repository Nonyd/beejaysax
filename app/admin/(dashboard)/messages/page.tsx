import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/admin/MessagesClient'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  await requireAdmin('messages')
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Messages"
        subtitle="Contact form submissions from the public site — bookings, collaborations, and general enquiries."
      />
      <MessagesClient initialMessages={JSON.parse(JSON.stringify(messages))} />
    </div>
  )
}
