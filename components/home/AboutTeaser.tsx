import Image from 'next/image'
import Link from 'next/link'

const DEMO_PORTRAIT = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'

export default function AboutTeaser() {
  return (
    <section style={{ background: '#080808', paddingTop: 120, paddingBottom: 120 }}>
      <div className="site-shell">
        <div
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
          style={{ alignItems: 'stretch' }}
        >
          <div className="flex justify-center lg:justify-start">
            <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: '#C9A84C',
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  marginLeft: 20,
                  position: 'relative',
                  overflow: 'hidden',
                  aspectRatio: '3/4',
                  border: '1px solid #1E1E1E',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                }}
              >
                <Image
                  src={DEMO_PORTRAIT}
                  alt="BeeJay Sax portrait"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width:1024px) 90vw, 440px"
                />
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 16,
              }}
            >
              The Artist
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px,4.5vw,56px)',
                fontWeight: 600,
                lineHeight: 1.08,
                color: '#F5F0E8',
                margin: '0 0 20px',
              }}
            >
              <span style={{ display: 'block' }}>A Sound That</span>
              <span style={{ display: 'block' }}>Moves Heaven.</span>
            </h2>

            <div style={{ width: 48, height: 2, background: '#C9A84C', marginBottom: 24 }} />

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 17,
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.72)',
                marginBottom: 18,
                maxWidth: 560,
              }}
            >
              Abolaji David Banjoko — known as BeeJay Sax — is one of Nigeria&apos;s most distinctive gospel saxophonists.
              His spirit-filled tone doesn&apos;t just fill rooms; it moves hearts.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 17,
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.72)',
                marginBottom: 36,
                maxWidth: 560,
              }}
            >
              A Mechanical Engineering graduate who traded blueprints for full-time ministry, BeeJay has graced stages
              alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
                borderTop: '1px solid #2A2A2A',
                paddingTop: 28,
                marginBottom: 36,
                maxWidth: 520,
              }}
            >
              {[
                { num: '2', label: 'Albums' },
                { num: '20+', label: 'Years Ministry' },
                { num: '3', label: 'Continents' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    textAlign: 'center',
                    borderRight: i < 2 ? '1px solid #2A2A2A' : 'none',
                    paddingLeft: i === 1 ? 8 : 0,
                    paddingRight: i === 1 ? 8 : 0,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(40px,5vw,56px)',
                      fontWeight: 700,
                      color: '#C9A84C',
                      lineHeight: 1,
                      margin: '0 0 8px',
                    }}
                  >
                    {s.num}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#666',
                      margin: 0,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Full Story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
