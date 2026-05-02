import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { format } from 'date-fns'
import { Music } from 'lucide-react'

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
      <section className="relative flex min-h-[45vh] flex-col justify-end px-8 pb-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Discography</SectionLabel>
          <h1 className="mt-6 font-serif text-[clamp(52px,9vw,120px)] font-bold text-bjs-white">The Music.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-24">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {releases.map((r) => (
            <Link key={r.id} href={`/releases/${r.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden border border-bjs-border bg-bjs-surface">
                {r.coverImage ? (
                  <Image
                    src={r.coverImage}
                    alt={`${r.title} — album cover`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.06]"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Music className="h-12 w-12 text-bjs-gold/25" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded border border-bjs-gold bg-bjs-gold-dim px-2 py-0.5 font-sans text-[10px] uppercase text-bjs-gold">
                  {r.releaseType}
                </span>
              </div>
              <p className="mt-3 font-serif text-lg text-bjs-white">{r.title}</p>
              {r.releaseDate && (
                <p className="mt-1 font-sans text-[13px] text-bjs-muted">{format(r.releaseDate, 'MMM yyyy')}</p>
              )}
            </Link>
          ))}
        </div>
        {releases.length === 0 && <p className="font-sans text-bjs-muted">Releases will appear here once added.</p>}
      </section>
    </>
  )
}
