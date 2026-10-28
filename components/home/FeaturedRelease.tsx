import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import PlatformStreamPills from '@/components/home/PlatformStreamPills'
import RecordSleeve from '@/components/ui/RecordSleeve'

const TYPE_LABEL: Record<string, string> = { ALBUM: 'Album', SINGLE: 'Single', EP: 'EP' }

export default async function FeaturedRelease() {
  const release = await safeDb(
    () =>
      prisma.release.findFirst({
        where: { isFeatured: true, isHidden: false },
        orderBy: [{ releaseDate: 'desc' }, { createdAt: 'desc' }],
      }),
    null
  )
  if (!release) return null

  const platforms = [
    { label: 'Spotify', url: release.spotifyUrl },
    { label: 'Apple Music', url: release.appleMusicUrl },
    { label: 'Audiomack', url: release.audiomackUrl },
    { label: 'YouTube', url: release.youtubeUrl },
    { label: 'Boomplay', url: release.boomplayUrl },
  ].filter((p): p is { label: string; url: string } => Boolean(p.url))

  return (
    <section className="bg-night py-24 md:py-32">
      <div className="site-shell grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <RecordSleeve
          title={release.title}
          coverImage={release.coverImage}
          sizes="(max-width:1024px) 80vw, 480px"
          className="mx-auto w-full max-w-[560px]"
        />

        <div className="min-w-0">
          <p className="font-body text-base font-medium text-gold">
            Latest {TYPE_LABEL[release.releaseType]?.toLowerCase() ?? 'release'}
          </p>
          <h2 className="mt-4 font-display text-[clamp(44px,6vw,84px)] leading-[0.95] tracking-[-0.02em] text-ivory">
            {release.title}
          </h2>
          {release.description && (
            <p className="mt-6 max-w-[50ch] font-body text-lg leading-relaxed text-ivory/75">{release.description}</p>
          )}

          {platforms.length > 0 ? (
            <div className="mt-10">
              <p className="mb-4 font-body text-sm text-ivory/60">Listen on</p>
              <PlatformStreamPills platforms={platforms} />
            </div>
          ) : (
            <p className="mt-8 font-body text-sm text-ivory/60">Streaming links are on the way.</p>
          )}

          <Link
            href={`/releases/${release.slug}`}
            className="mt-10 inline-block font-body text-base font-semibold text-gold underline decoration-gold/40 underline-offset-[6px] transition-colors hover:decoration-gold"
          >
            About this release
          </Link>
        </div>
      </div>
    </section>
  )
}
