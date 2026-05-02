'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { Release } from '@prisma/client'
import { format } from 'date-fns'
import { registerGSAP, scaleInOnScroll } from '@/lib/animations'

export default function FeaturedRelease({ release }: { release: Release | null }) {
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (coverRef.current) scaleInOnScroll(coverRef.current)
  }, [])

  if (!release) return null

  return (
    <section
      style={{
        background: '#0F0F0F',
        borderTop: '1px solid #1E1E1E',
        borderBottom: '1px solid #1E1E1E',
        paddingTop: 140,
        paddingBottom: 140,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-16">
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
          LATEST RELEASE
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr',
            gap: 80,
            alignItems: 'center',
          }}
          className="grid-cols-1 md:grid-cols-[2fr_3fr]"
        >
          <div
            ref={coverRef}
            style={{ aspectRatio: '1/1', position: 'relative', overflow: 'hidden', flexShrink: 0 }}
          >
            {release.coverImage ? (
              <Image
                src={release.coverImage}
                alt={`${release.title} — album cover`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width:768px) 100vw, 40vw"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1204 0%, #2d1f06 50%, #0d0a02 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(201,168,76,0.4)',
                    marginBottom: 12,
                  }}
                >
                  ALBUM
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(18px, 3vw, 28px)',
                    fontStyle: 'italic',
                    color: '#C9A84C',
                    textAlign: 'center',
                    padding: '0 24px',
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
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                marginBottom: 20,
                minHeight: 28,
              }}
            >
              {release.releaseType}
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 4vw, 52px)',
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: '#F5F0E8',
                marginBottom: 20,
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
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {release.description}
              </p>
            )}

            {release.releaseDate && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: '#4A4A4A',
                  marginBottom: release.description ? 24 : 32,
                }}
              >
                {format(release.releaseDate, 'MMMM d, yyyy')}
              </p>
            )}

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 16,
              }}
            >
              STREAM NOW
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {[
                { label: 'Spotify', url: release.spotifyUrl },
                { label: 'Apple Music', url: release.appleMusicUrl },
                { label: 'Audiomack', url: release.audiomackUrl },
                { label: 'YouTube', url: release.youtubeUrl },
                { label: 'Boomplay', url: release.boomplayUrl },
              ]
                .filter((p): p is { label: string; url: string } => !!p.url)
                .map((platform) => (
                  <a
                    key={platform.label}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#F5F0E8',
                      textDecoration: 'none',
                      border: '1px solid #2A2A2A',
                      padding: '10px 18px',
                      minHeight: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#C9A84C'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#2A2A2A'
                      ;(e.currentTarget as HTMLAnchorElement).style.color = '#F5F0E8'
                    }}
                  >
                    {platform.label}
                  </a>
                ))}
            </div>

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
