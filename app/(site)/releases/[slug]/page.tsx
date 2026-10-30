import type { Metadata } from 'next'
import Link from 'next/link'
import Adire from '@/components/ui/Adire'
import RecordSleeve from '@/components/ui/RecordSleeve'
import PlatformStreamPills from '@/components/home/PlatformStreamPills'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { fmt } from '@/lib/time'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const release = await safeDb(() => prisma.release.findFirst({ where: { slug, isHidden: false } }), null)
  if (!release) return { title: { absolute: 'Release Not Found — BeeJay Sax' } }

  return {
    title: { absolute: `${release.title} — BeeJay Sax` },
    description: release.description ?? `${release.title} by BeeJay Sax. Stream now on all platforms.`,
    openGraph: {
      title: release.title,
      description: release.description ?? `Gospel saxophone — ${release.releaseType.toLowerCase()} by BeeJay Sax`,
      url: `https://beejaysax.com/releases/${slug}`,
      images: release.coverImage ? [{ url: release.coverImage, width: 1200, height: 1200 }] : [],
    },
  }
}

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = { ALBUM: 'Album', SINGLE: 'Single', EP: 'EP' }

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params
  const release = await safeDb(() => prisma.release.findFirst({ where: { slug, isHidden: false } }), null)
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
    <article className="relative -mt-[72px] overflow-hidden bg-night pt-[72px]">
      <Adire variant="field" color="var(--gold)" opacity={0.05} />
      <div className="site-shell relative py-16 md:py-24">
        <Link href="/releases" className="font-body text-sm font-semibold text-gold no-underline hover:underline">
          All music
        </Link>

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <RecordSleeve
            title={release.title}
            coverImage={release.coverImage}
            sizes="(max-width:1024px) 80vw, 520px"
            className="mx-auto w-full max-w-[580px]"
          />

          <div className="min-w-0">
            <p className="font-body text-lg font-medium text-gold">
              {TYPE_LABEL[release.releaseType] ?? 'Release'}
              {release.releaseDate ? `, released ${fmt(release.releaseDate, 'd MMMM yyyy')}` : ''}
            </p>
            <h1 className="mt-4 font-display text-[clamp(52px,7vw,104px)] leading-[0.92] tracking-[-0.03em] text-ivory">
              {release.title}
            </h1>
            {release.description && (
              <p className="mt-6 max-w-[52ch] font-body text-lg leading-relaxed text-ivory/80">{release.description}</p>
            )}

            <div className="mt-10">
              {links.length > 0 ? (
                <>
                  <p className="mb-4 font-body text-sm text-ivory/60">Listen on</p>
                  <PlatformStreamPills platforms={links} />
                </>
              ) : (
                <p className="font-body text-base text-ivory/65">Streaming links are on the way. Check back soon.</p>
              )}
            </div>
          </div>
        </div>

        {yt?.[1] && (
          <div className="mt-20 aspect-video overflow-hidden rounded-[28px] bg-ink shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <iframe
              title={release.title}
              src={`https://www.youtube.com/embed/${yt[1]}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        )}
      </div>
    </article>
  )
}
