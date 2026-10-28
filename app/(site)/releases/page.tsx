import type { Metadata } from 'next'
import ReleasesView from '@/components/releases/ReleasesView'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

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
  const releases = await safeDb(() => prisma.release.findMany({ orderBy: { releaseDate: 'desc' } }), [])

  return (
    <>
      <PageHero
        title={['The music']}
        intro="Albums, singles and EPs of gospel saxophone. Stream them wherever you listen."
      />
      <ReleasesView releases={releases} />
    </>
  )
}
