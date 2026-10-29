import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { NewCampaignButton } from '@/components/admin/CampaignEditor'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Draft', cls: 'text-[rgba(247,241,227,0.7)]' },
  SENDING: { label: 'Sending', cls: 'text-[#f0a35e]' },
  SENT: { label: 'Sent', cls: 'text-[#4ade80]' },
  CANCELLED: { label: 'Stopped', cls: 'text-[#f87171]' },
}

export default async function AdminCampaignsPage() {
  const [campaigns, subscribed, counts] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.contact.count({ where: { status: 'SUBSCRIBED' } }),
    prisma.campaignDelivery.groupBy({ by: ['campaignId', 'status'], _count: true }),
  ])
  const n = (id: string, ...s: string[]) => counts.filter((c) => c.campaignId === id && s.includes(c.status)).reduce((a, c) => a + c._count, 0)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Communication"
        title="Campaigns"
        subtitle={`Write an email once and send it to your mailing list (${subscribed.toLocaleString()} subscribed) or to one tag of it.`}
        action={<NewCampaignButton />}
      />

      <div className="overflow-x-auto rounded-[18px] border border-[rgba(247,241,227,0.12)]">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="bg-[#1B1F4B] text-[12px] text-[rgba(247,241,227,0.6)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Campaign</th>
              <th className="px-3 py-3 font-semibold">Audience</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Sent</th>
              <th className="px-3 py-3 font-semibold">Delivered</th>
              <th className="px-3 py-3 font-semibold">Bounced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(247,241,227,0.08)]">
            {campaigns.map((c) => {
              const s = STATUS[c.status] ?? STATUS.DRAFT
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/campaigns/${c.id}`} className="text-[#F7F1E3] underline-offset-4 hover:underline">
                      {c.subject || 'Untitled campaign'}
                    </Link>
                    <p className="text-[12px] text-[rgba(247,241,227,0.55)]">
                      {c.startedAt ? `Sent ${fmt(c.startedAt, 'd MMM yyyy, HH:mm')}` : `Created ${fmt(c.createdAt, 'd MMM yyyy')}`}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-[rgba(247,241,227,0.8)]">{c.audienceTag ?? 'Everyone subscribed'}</td>
                  <td className={`px-3 py-3 font-semibold ${s.cls}`}>{s.label}</td>
                  <td className="px-3 py-3 text-[rgba(247,241,227,0.8)]">
                    {c.status === 'DRAFT' ? '—' : `${n(c.id, 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED').toLocaleString()} / ${c.recipients.toLocaleString()}`}
                  </td>
                  <td className="px-3 py-3 text-[rgba(247,241,227,0.8)]">{c.status === 'DRAFT' ? '—' : n(c.id, 'DELIVERED').toLocaleString()}</td>
                  <td className="px-3 py-3 text-[rgba(247,241,227,0.8)]">{c.status === 'DRAFT' ? '—' : n(c.id, 'BOUNCED', 'COMPLAINED').toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && <p className="px-6 py-12 text-center text-[rgba(247,241,227,0.6)]">No campaigns yet. Start with “New campaign”.</p>}
      </div>
    </div>
  )
}
