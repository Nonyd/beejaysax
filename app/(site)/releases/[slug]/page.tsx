import type { Metadata } from 'next'
import Link from 'next/link'
import Adire from '@/components/ui/Adire'
import RecordSleeve from '@/components/ui/RecordSleeve'
import PlatformStreamPills from '@/components/home/PlatformStreamPills'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { fmt } from '@/lib/time'
import { toPreviewRelease } from '@/lib/previews'
import { PreviewButton, Tracklist } from '@/components/player/PreviewControls'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, pageMetadata, releaseJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const release = await safeDb(() => prisma.release.findFirst({ where: { slug, isHidden: false } }), null)
  if (!release) return { title: { absolute: 'Release Not Found — BeeJay Sax' }, robots: { index: false } }

  const kind = release.releaseType === 'SINGLE' ? 'single' : release.releaseType === 'EP' ? 'EP' : 'album'
  return pageMetadata({
    title: `${release.title} — BeeJay Sax (${kind})`,
    description: release.description?.slice(0, 160) ?? `${release.title}, a gospel saxophone ${kind} by BeeJay Sax. Stream on Spotify, Apple Music, Audiomack and YouTube.`,
    path: `/releases/${slug}`,
    shareTitle: release.title,
    shareDescription: release.description?.slice(0, 160) ?? `Gospel saxophone ${kind} by BeeJay Sax`,
    image: release.coverImage ? { url: release.coverImage, width: 1200, height: 1200, alt: `${release.title} cover art` } : null,
    type: release.releaseType === 'SINGLE' ? 'music.song' : 'music.album',
  })
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

  const preview = await toPreviewRelease(release)
  const yt = release.youtubeUrl?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)

  return (
    <article className="relative -mt-[72px] overflow-hidden bg-night pt-[72px]">
      <JsonLd data={[releaseJsonLd(release), breadcrumbJsonLd([{ name: 'Music', path: '/releases' }, { name: release.title, path: `/releases/${release.slug}` }])]} />
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

            <PreviewButton release={preview} className="mt-8" />

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

        {preview.tracks.length > 0 && (
          <section className="mt-20" aria-labelledby="tracks-heading">
            <h2 id="tracks-heading" className="mb-6 font-display text-[clamp(32px,4vw,48px)] leading-none text-ivory">
              Tracks
            </h2>
            <Tracklist release={preview} />
            {preview.tracks.some((t) => t.previewUrl) && (
              <p className="mt-4 font-body text-sm text-ivory/50">Tap a track to hear a 30-second preview.</p>
            )}
          </section>
        )}

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
