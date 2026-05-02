import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'
import { format } from 'date-fns'

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
      description: release.description ?? `Gospel saxophone — ${release.releaseType.toLowerCase()} by BeeJay Sax`,
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
    <article className="site-shell py-24">
      <Link href="/releases" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#C9A84C', textDecoration: 'none' }}>
        ← All Releases
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', border: '1px solid #1E1E1E', background: '#0F0F0F' }}>
          {release.coverImage ? (
            <Image src={release.coverImage} alt={`${release.title} — album cover`} fill style={{ objectFit: 'cover' }} sizes="(max-width:1024px) 100vw, 50vw" />
          ) : (
            <div
              style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                background: 'linear-gradient(135deg, #1a1204 0%, #2d1f06 50%, #0d0a02 100%)',
              }}
            >
              <p
                style={{
                  textAlign: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(18px,4vw,28px)',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#C9A84C',
                  margin: 0,
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
              display: 'inline-flex',
              border: '1px solid #C9A84C',
              background: 'rgba(201,168,76,0.08)',
              padding: '6px 12px',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}
          >
            {release.releaseType}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(38px,6vw,80px)',
              fontWeight: 600,
              color: '#F5F0E8',
              margin: '24px 0 0',
            }}
          >
            {release.title}
          </h1>
          {release.releaseDate && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#555', marginTop: 16 }}>
              {format(release.releaseDate, 'MMMM d, yyyy')}
            </p>
          )}
          {release.description && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.75, color: 'rgba(245,240,232,0.8)', marginTop: 32 }}>
              {release.description}
            </p>
          )}

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              margin: '40px 0 16px',
            }}
          >
            Listen Now
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #1E1E1E',
                  background: '#141414',
                  padding: '16px 20px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: '#F5F0E8',
                  textDecoration: 'none',
                  transition: 'border-color 200ms',
                }}
              >
                <span>{l.label}</span>
                <span style={{ color: '#555', fontSize: 12 }}>Listen on {l.label}</span>
              </a>
            ))}
          </div>

          {yt?.[1] && (
            <div style={{ marginTop: 40, position: 'relative', aspectRatio: '16/9', overflow: 'hidden', border: '1px solid #1E1E1E' }}>
              <iframe
                title={release.title}
                src={`https://www.youtube.com/embed/${yt[1]}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
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
