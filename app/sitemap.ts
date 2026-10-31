import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { absoluteUrl, SITE_URL } from '@/lib/seo'

/** Generated on each request so build does not require a live database. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, releases, latestVideo] = await Promise.all([
    safeDb(
      () =>
        prisma.event.findMany({
          where: { status: 'UPCOMING' },
          select: { id: true, updatedAt: true, posterImage: true },
          orderBy: { eventDate: 'desc' },
        }),
      []
    ),
    safeDb(
      () =>
        prisma.release.findMany({
          where: { isHidden: false },
          select: { slug: true, updatedAt: true, coverImage: true },
          orderBy: { releaseDate: { sort: 'desc', nulls: 'last' } },
        }),
      []
    ),
    safeDb(() => prisma.video.findFirst({ where: { isHidden: false }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }), null),
  ])

  const newest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined)
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], lastModified?: Date) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    ...(path === '' ? { images: [absoluteUrl('/og.jpg')] } : {}),
  })

  return [
    page('', 1.0, 'weekly'),
    page('/events', 0.9, 'weekly', newest(events.map((e) => e.updatedAt))),
    page('/releases', 0.8, 'monthly', newest(releases.map((r) => r.updatedAt))),
    page('/about', 0.8, 'monthly'),
    page('/videos', 0.7, 'weekly', latestVideo?.createdAt),
    page('/gallery', 0.6, 'monthly'),
    page('/contact', 0.6, 'yearly'),
    ...['/privacy', '/cookies', '/terms', '/ticket-terms'].map((p) => page(p, 0.2, 'yearly')),
    ...events.map((e) => ({
      url: `${SITE_URL}/events/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      ...(e.posterImage ? { images: [absoluteUrl(e.posterImage)] } : {}),
    })),
    ...releases.map((r) => ({
      url: `${SITE_URL}/releases/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...(r.coverImage ? { images: [absoluteUrl(r.coverImage)] } : {}),
    })),
  ]
}
