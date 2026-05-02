import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/admin/MessagesClient'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8' }}>Messages</h2>
        <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Contact form submissions</p>
      </div>
      <MessagesClient initialMessages={JSON.parse(JSON.stringify(messages))} />
    </div>
  )
}
