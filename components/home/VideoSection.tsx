'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const VIDEOS = [
  { id: '0jxRD456j_w', title: 'BeeJay Sax Live in London, Indigo O2' },
  { id: 'z4saapf2BrA', title: 'BeeJay Sax at House on the Rock (TAPE 2022)' },
]

function VideoCard({ video, large = false }: { video: (typeof VIDEOS)[0]; large?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const thumb = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: '16/9',
        background: '#0F0F0F',
        cursor: 'pointer',
      }}
      onClick={() => setPlaying(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setPlaying(true)
      }}
      role="button"
      tabIndex={0}
    >
      {playing ? (
        <iframe
          title={video.title}
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <>
          <Image src={thumb} alt={video.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:1200px) 100vw, 1200px" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.4)' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: large ? 64 : 44,
                height: large ? 64 : 44,
                borderRadius: '50%',
                background: '#C9A84C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 200ms',
              }}
            >
              <svg width={large ? 20 : 14} height={large ? 20 : 14} viewBox="0 0 24 24" fill="#080808">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 100%)',
              padding: '24px 16px 16px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#F5F0E8', margin: 0 }}>{video.title}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function VideoSection() {
  return (
    <section style={{ background: '#080808', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 16,
          }}
        >
          Watch
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px,4vw,52px)',
            fontWeight: 600,
            lineHeight: 1.05,
            color: '#F5F0E8',
            margin: '0 0 48px',
          }}
        >
          <span style={{ display: 'block' }}>Experience The</span>
          <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Performance.</span>
        </h2>

        {VIDEOS[0] && (
          <div style={{ marginBottom: 12 }}>
            <VideoCard video={VIDEOS[0]} large />
          </div>
        )}

        {VIDEOS.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
            {VIDEOS.slice(1).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            href="https://youtube.com/@beejaysax"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '12px 28px',
              display: 'inline-block',
            }}
          >
            View All Videos →
          </Link>
        </div>
      </div>
    </section>
  )
}
