import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import PlatformStreamPills from '@/components/home/PlatformStreamPills'

export default async function FeaturedRelease() {
  const release = await safeDb(() => prisma.release.findFirst({ where: { isFeatured: true } }), null)
  if (!release) return null

  const platforms = [
    { label: 'Spotify', url: release.spotifyUrl },
    { label: 'Apple Music', url: release.appleMusicUrl },
    { label: 'Audiomack', url: release.audiomackUrl },
    { label: 'YouTube', url: release.youtubeUrl },
    { label: 'Boomplay', url: release.boomplayUrl },
  ].filter((p): p is { label: string; url: string } => Boolean(p.url))

  return (
    <section
      style={{
        background: '#0F0F0F',
        borderTop: '1px solid #1E1E1E',
        borderBottom: '1px solid #1E1E1E',
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 56,
          }}
        >
          Latest Release
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]" style={{ gap: 80, alignItems: 'center' }}>
          <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', width: '100%' }}>
            {release.coverImage ? (
              <Image src={release.coverImage} alt={release.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 400px" />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1204, #0d0a02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 32,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(201,168,76,0.4)',
                    marginBottom: 16,
                  }}
                >
                  {release.releaseType}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(20px,2vw,28px)',
                    fontStyle: 'italic',
                    color: '#C9A84C',
                    textAlign: 'center',
                  }}
                >
                  {release.title}
                </p>
              </div>
            )}
          </div>

          <div>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.3)',
                padding: '5px 12px',
                display: 'inline-block',
                marginBottom: 20,
              }}
            >
              {release.releaseType}
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px,4vw,52px)',
                fontWeight: 600,
                lineHeight: 1.05,
                color: '#F5F0E8',
                margin: '0 0 20px',
              }}
            >
              {release.title}
            </h2>

            <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 20 }} />

            {release.description && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(245,240,232,0.6)',
                  marginBottom: 32,
                }}
              >
                {release.description}
              </p>
            )}

            {platforms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    marginBottom: 16,
                  }}
                >
                  Stream Now
                </p>
                <PlatformStreamPills platforms={platforms} />
              </div>
            )}

            <Link
              href={`/releases/${release.slug}`}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                textDecoration: 'none',
              }}
            >
              More About This Release →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
