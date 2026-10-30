import type { Metadata } from 'next'
import ReleasesView from '@/components/releases/ReleasesView'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { getContent } from '@/lib/content/store'
import { toPreviewRelease } from '@/lib/previews'

export const metadata: Metadata = {
  title: { absolute: 'Music — BeeJay Sax' },
  description:
    'Discography of BeeJay Sax — gospel saxophone albums, singles, and EPs. Stream on Spotify, Apple Music, Audiomack, and YouTube.',
  openGraph: {
    title: 'BeeJay Sax — Discography',
    description: 'Albums, singles, and EPs. Gospel saxophone music for every season.',
    url: 'https://beejaysax.com/releases',
  },
}

export const dynamic = 'force-dynamic'

export default async function ReleasesPage() {
  const h = await getContent('pageHeaders')
  const releases = await safeDb(() => prisma.release.findMany({ where: { isHidden: false }, orderBy: { releaseDate: 'desc' } }), [])
  // Track previews come from Apple's catalogue (cached for a day); lookups run side by side.
  const previews = Object.fromEntries(await Promise.all(releases.map(async (r) => [r.id, await toPreviewRelease(r)] as const)))

  return (
    <>
      <PageHero
        title={[h.musicTitle]}
        intro={h.musicIntro}
      />
      <ReleasesView releases={releases} previews={previews} />
    </>
  )
}
