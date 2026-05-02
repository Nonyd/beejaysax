import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

/** Generated on each request so build does not require a live database. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://beejaysax.com'

  const [events, releases] = await Promise.all([
    prisma.event.findMany({ where: { status: 'UPCOMING' }, select: { id: true, updatedAt: true } }),
    prisma.release.findMany({ select: { slug: true, updatedAt: true } }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/releases`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${baseUrl}/events/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const releasePages: MetadataRoute.Sitemap = releases.map((r) => ({
    url: `${baseUrl}/releases/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...eventPages, ...releasePages]
}
