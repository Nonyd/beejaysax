import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import CampaignEditor from '@/components/admin/CampaignEditor'
import { tagCounts } from '@/lib/mailing/contacts'
import { audienceSize, campaignStats } from '@/lib/mailing/campaigns'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function AdminCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await prisma.campaign.findUnique({ where: { id } })
  if (!c) notFound()
  const [tags, everyone, stats, failures] = await Promise.all([
    tagCounts(),
    audienceSize(null),
    c.status === 'DRAFT' ? null : campaignStats(c.id, c.recipients),
    c.status === 'DRAFT'
      ? []
      : prisma.campaignDelivery.findMany({
          where: { campaignId: c.id, status: { in: ['FAILED', 'BOUNCED', 'COMPLAINED'] } },
          select: { email: true, status: true, error: true },
          take: 50,
        }),
  ])

  return (
    <div>
      <AdminPageHeader
        eyebrow="Campaigns"
        title={c.subject || 'New campaign'}
        subtitle={
          c.status === 'DRAFT'
            ? 'Write your email on the left and check the preview on the right. Send yourself a test before sending it to the list.'
            : `Sending started ${c.startedAt ? fmt(c.startedAt, 'd MMM yyyy, HH:mm') : ''}. Sent emails can’t be edited; use “Duplicate” to send a new version.`
        }
      />
      <CampaignEditor
        campaign={{
          id: c.id,
          status: c.status,
          subject: c.subject,
          preheader: c.preheader ?? '',
          heading: c.heading ?? '',
          body: c.body,
          imageUrl: c.imageUrl ?? '',
          buttonLabel: c.buttonLabel ?? '',
          buttonUrl: c.buttonUrl ?? '',
          audienceTag: c.audienceTag ?? '',
        }}
        audiences={[{ tag: '', label: 'Everyone subscribed', size: everyone }, ...tags.filter((t) => t.subscribed > 0).map((t) => ({ tag: t.tag, label: t.tag, size: t.subscribed }))]}
        stats={stats}
        failures={failures}
      />
    </div>
  )
}
