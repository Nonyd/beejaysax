import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'
import { fmt } from '@/lib/time'
import { LEGAL_NAME, SITE_NAME, SITE_URL } from '@/lib/seo'

/**
 * /llms.txt: a plain summary of who BeeJay Sax is and where things are on the site, for AI
 * assistants and answer engines (https://llmstxt.org). Built from the same content as the pages.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const [seo, about, site, events, releases] = await Promise.all([
    getContent('seo'),
    getContent('about'),
    getContent('site'),
    safeDb(
      () =>
        prisma.event.findMany({
          where: { status: 'UPCOMING' },
          orderBy: { eventDate: 'asc' },
          select: { id: true, title: true, venue: true, city: true, country: true, eventDate: true },
        }),
      []
    ),
    safeDb(
      () =>
        prisma.release.findMany({
          where: { isHidden: false },
          orderBy: { releaseDate: { sort: 'desc', nulls: 'last' } },
          select: { slug: true, title: true, releaseType: true, releaseDate: true },
          take: 30,
        }),
      []
    ),
  ])

  const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim()
  const socials = site.socials.filter((s) => /^https:\/\/[^/]+\/./.test(s.url))

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${oneLine(seo.description)}`,
    '',
    `${SITE_NAME} is the stage name of ${LEGAL_NAME}, a Nigerian gospel saxophonist and music minister based in Lagos. ${oneLine(about.intro)}`,
    '',
    ...about.story.split(/\n\s*\n/).map(oneLine).filter(Boolean).flatMap((p) => [p, '']),
    ...(about.sharedNames.length ? [`${about.sharedLabel}: ${about.sharedNames.join(', ')}.`, ''] : []),
    '## Pages',
    '',
    `- [About](${SITE_URL}/about): biography of ${LEGAL_NAME} (BeeJay Sax)`,
    `- [Music](${SITE_URL}/releases): albums, EPs and singles, with streaming links`,
    `- [Videos](${SITE_URL}/videos): live ministrations and performances`,
    `- [Events](${SITE_URL}/events): upcoming concerts and ticket sales`,
    `- [Gallery](${SITE_URL}/gallery): performance photos`,
    `- [Contact and bookings](${SITE_URL}/contact): book BeeJay Sax for concerts, church programmes and events`,
    '',
  ]
  if (events.length) {
    lines.push('## Upcoming events', '')
    for (const e of events) lines.push(`- [${e.title}](${SITE_URL}/events/${e.id}): ${fmt(e.eventDate, 'd MMMM yyyy')}, ${e.venue}, ${e.city}, ${e.country}`)
    lines.push('')
  }
  if (releases.length) {
    lines.push('## Music', '')
    for (const r of releases) {
      const year = r.releaseDate ? ` (${r.releaseDate.getFullYear()})` : ''
      lines.push(`- [${r.title}](${SITE_URL}/releases/${r.slug}): ${r.releaseType.toLowerCase()}${year}`)
    }
    lines.push('')
  }
  if (socials.length) {
    lines.push('## Official profiles', '')
    for (const s of socials) lines.push(`- [${s.label}](${s.url})`)
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
