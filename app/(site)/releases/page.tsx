import type { Metadata } from 'next'
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
  const releases = await safeDb(() => prisma.release.findMany({ orderBy: { releaseDate: 'desc' } }), [])

  return (
    <>
      <section
        style={{
          height: 320,
          position: 'relative',
          overflow: 'hidden',
          background: '#0F0F0F',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 12,
              }}
            >
              Discography
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(48px,8vw,96px)',
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              <span style={{ display: 'block' }}>The Music.</span>
            </h1>
          </div>
        </div>
      </section>

      <ReleasesView releases={releases} />
    </>
  )
}
