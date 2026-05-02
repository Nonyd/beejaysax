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
      <div className="site-shell">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: 12,
            }}
          >
            Latest Release
          </p>
          <div style={{ height: 1, maxWidth: 120, background: '#C9A84C', margin: '0 auto', opacity: 0.5 }} />
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex justify-center">
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '1/1',
                width: '100%',
                maxWidth: 420,
                border: '1px solid #2A2A2A',
                boxShadow: '0 28px 100px rgba(0,0,0,0.35)',
              }}
            >
              {release.coverImage ? (
                <Image
                  src={release.coverImage}
                  alt={release.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width:1024px) 100vw, 420px"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(145deg, #1a1204, #0d0a02)',
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
                      fontSize: 10,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: 'rgba(201,168,76,0.45)',
                      marginBottom: 16,
                    }}
                  >
                    {release.releaseType}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(22px,3vw,30px)',
                      fontStyle: 'italic',
                      color: '#C9A84C',
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    {release.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.35)',
                padding: '6px 14px',
                display: 'inline-block',
                marginBottom: 18,
              }}
            >
              {release.releaseType}
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(30px,4.5vw,48px)',
                fontWeight: 600,
                lineHeight: 1.1,
                color: '#F5F0E8',
                margin: '0 0 18px',
              }}
            >
              {release.title}
            </h2>

            <div style={{ width: 48, height: 2, background: '#C9A84C', marginBottom: 22 }} />

            {release.description && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: 'rgba(245,240,232,0.72)',
                  marginBottom: 28,
                  maxWidth: 560,
                }}
              >
                {release.description}
              </p>
            )}

            {platforms.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 10,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    marginBottom: 14,
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
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
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
