import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { audienceSize, campaignStats, CampaignError, cancelCampaign, pumpCampaigns, sendCampaignTest, startCampaign } from '@/lib/mailing/campaigns'

export const runtime = 'nodejs'
export const maxDuration = 120

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
const opt = (v: unknown, max: number) => str(v, max).trim() || null

function fields(b: Record<string, unknown>) {
  const buttonUrl = opt(b.buttonUrl, 500)
  if (buttonUrl && !/^(https:\/\/|\/)/i.test(buttonUrl)) throw new CampaignError('The button link must start with https:// (or / for a page on this site).')
  const imageUrl = opt(b.imageUrl, 500)
  if (imageUrl && !/^(https:\/\/|\/uploads\/)/i.test(imageUrl)) throw new CampaignError('Upload the photo, or use a link starting with https://.')
  return {
    subject: str(b.subject, 200),
    preheader: opt(b.preheader, 200),
    heading: opt(b.heading, 200),
    body: str(b.body, 20_000),
    imageUrl,
    buttonLabel: opt(b.buttonLabel, 60),
    buttonUrl,
    audienceTag: opt(b.audienceTag, 40),
  }
}

/**
 * Campaigns.
 *   { action: 'create' } → { id }               { action: 'save', id, ...fields }
 *   { action: 'test', id, to, ...fields }       { action: 'send', id }
 *   { action: 'pump' } → progress of sends       { action: 'cancel', id }
 *   { action: 'duplicate', id } → { id }        { action: 'delete', id } (drafts only)
 *   { action: 'audience', tag } → { size }
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdminApi()
  if (gate instanceof NextResponse) return gate
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const id = typeof b.id === 'string' ? b.id : ''

  try {
    switch (b.action) {
      case 'create': {
        const c = await prisma.campaign.create({ data: { subject: '', body: '' } })
        return NextResponse.json({ id: c.id })
      }
      case 'save': {
        const r = await prisma.campaign.updateMany({ where: { id, status: 'DRAFT' }, data: fields(b) })
        if (!r.count) return bad('Only drafts can be edited.')
        return NextResponse.json({ ok: true })
      }
      case 'test': {
        const to = str(b.to, 200).trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return bad('Enter the email address to send the test to.')
        const f = fields(b)
        if (!f.subject.trim() || !f.body.trim()) return bad('Add a subject and a message first.')
        const r = await sendCampaignTest(f, to)
        return r.ok ? NextResponse.json({ ok: true, provider: r.provider }) : bad(`Not sent: ${r.error}`, 502)
      }
      case 'send': {
        const recipients = await startCampaign(id)
        const progress = await pumpCampaigns(15_000)
        return NextResponse.json({ ok: true, recipients, progress })
      }
      case 'pump': {
        const progress = await pumpCampaigns(20_000)
        const c = id ? await prisma.campaign.findUnique({ where: { id } }) : null
        return NextResponse.json({ ok: true, progress, status: c?.status, stats: c ? await campaignStats(c.id, c.recipients) : null })
      }
      case 'cancel':
        await cancelCampaign(id)
        return NextResponse.json({ ok: true })
      case 'duplicate': {
        const c = await prisma.campaign.findUnique({ where: { id } })
        if (!c) return bad('Campaign not found.', 404)
        const copy = await prisma.campaign.create({
          data: {
            subject: c.subject, preheader: c.preheader, heading: c.heading, body: c.body,
            imageUrl: c.imageUrl, buttonLabel: c.buttonLabel, buttonUrl: c.buttonUrl, audienceTag: c.audienceTag,
          },
        })
        return NextResponse.json({ id: copy.id })
      }
      case 'delete': {
        const r = await prisma.campaign.deleteMany({ where: { id, status: 'DRAFT' } })
        return r.count ? NextResponse.json({ ok: true }) : bad('Only drafts can be deleted.')
      }
      case 'audience':
        return NextResponse.json({ size: await audienceSize(opt(b.tag, 40)) })
      default:
        return bad('Unknown action.')
    }
  } catch (e) {
    if (e instanceof CampaignError) return bad(e.message)
    console.error('[/api/admin/campaigns]', e)
    return bad('Something went wrong. Try again.', 500)
  }
}
