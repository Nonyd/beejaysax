import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { format } from 'date-fns'
import { Music } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const release = await safeDb(() => prisma.release.findUnique({ where: { slug } }), null)
  if (!release) return { title: { absolute: 'Release Not Found — BeeJay Sax' } }

  return {
    title: { absolute: `${release.title} — BeeJay Sax` },
    description: release.description ?? `${release.title} by BeeJay Sax. Stream now on all platforms.`,
    openGraph: {
      title: release.title,
      description:
        release.description ?? `Gospel saxophone — ${release.releaseType.toLowerCase()} by BeeJay Sax`,
      url: `https://beejaysax.com/releases/${slug}`,
      images: release.coverImage ? [{ url: release.coverImage, width: 1200, height: 1200 }] : [],
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params
  const release = await safeDb(() => prisma.release.findUnique({ where: { slug } }), null)
  if (!release) notFound()

  const links = [
    { url: release.spotifyUrl, label: 'Spotify' },
    { url: release.appleMusicUrl, label: 'Apple Music' },
    { url: release.audiomackUrl, label: 'Audiomack' },
    { url: release.youtubeUrl, label: 'YouTube' },
    { url: release.boomplayUrl, label: 'Boomplay' },
  ].filter((l): l is { url: string; label: string } => !!l.url)

  const yt = release.youtubeUrl?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)

  return (
    <article className="mx-auto max-w-7xl px-8 py-24">
      <Link href="/releases" className="font-sans text-sm text-bjs-gold hover:underline">
        ← All Releases
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-square overflow-hidden border border-bjs-border bg-bjs-surface">
          {release.coverImage ? (
            <Image
              src={release.coverImage}
              alt={`${release.title} — album cover`}
              fill
              className="object-cover"
              sizes="50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Music className="h-24 w-24 text-bjs-gold/25" />
            </div>
          )}
        </div>

        <div>
          <span className="inline-flex rounded border border-bjs-gold bg-bjs-gold-dim px-3 py-1 font-sans text-[11px] uppercase tracking-wide text-bjs-gold">
            {release.releaseType}
          </span>
          <h1 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold text-bjs-white">{release.title}</h1>
          {release.releaseDate && (
            <p className="mt-4 font-sans text-bjs-muted">{format(release.releaseDate, 'MMMM d, yyyy')}</p>
          )}
          {release.description && (
            <p className="mt-8 font-sans text-base leading-relaxed text-bjs-white/80">{release.description}</p>
          )}

          <h2 className="section-label mt-12 border-none pl-0">Listen Now</h2>
          <div className="mt-6 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-bjs-border bg-bjs-surface2 px-5 py-4 font-sans text-sm text-bjs-white transition-colors hover:border-bjs-gold"
              >
                <span>{l.label}</span>
                <span className="text-bjs-muted">Listen on {l.label}</span>
              </a>
            ))}
          </div>

          {yt?.[1] && (
            <div className="mt-10 aspect-video overflow-hidden border border-bjs-border">
              <iframe
                title={release.title}
                src={`https://www.youtube.com/embed/${yt[1]}`}
                className="h-full w-full"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
