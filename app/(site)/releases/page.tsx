import type { Metadata } from 'next'
import SectionLabel from '@/components/ui/SectionLabel'
import { h1TextStyle } from '@/lib/typography-styles'
import ReleasesView from '@/components/releases/ReleasesView'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

export const metadata: Metadata = {
  title: { absolute: 'Releases — BeeJay Sax' },
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
  const releases = await safeDb(
    () => prisma.release.findMany({ orderBy: { releaseDate: 'desc' } }),
    []
  )

  return (
    <>
      <section
        className="relative flex min-h-[360px] h-[45vh] flex-col justify-end overflow-hidden"
        style={{
          background: [
            'linear-gradient(135deg, #080808 0%, #0F0F0F 50%, #080808 100%)',
            'radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          ].join(', '),
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(201,168,76,0.04)_0%,transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-32 md:px-12">
          <SectionLabel>Discography</SectionLabel>
          <h1 className="mt-3 text-bjs-white" style={h1TextStyle}>
            The Music.
          </h1>
        </div>
      </section>

      <ReleasesView releases={releases} />
    </>
  )
}
