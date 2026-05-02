import Image from 'next/image'
import Link from 'next/link'

const DEMO_PORTRAIT = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'

export default function AboutTeaser() {
  return (
    <section style={{ background: '#080808', paddingTop: 120, paddingBottom: 120 }}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background: '#C9A84C',
                zIndex: 1,
              }}
            />
            <div style={{ marginLeft: 20, position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
              <Image src={DEMO_PORTRAIT} alt="BeeJay Sax portrait" fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: 20,
              }}
            >
              The Artist
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 600,
                lineHeight: 1.05,
                color: '#F5F0E8',
                margin: '0 0 24px',
              }}
            >
              <span style={{ display: 'block' }}>A Sound That</span>
              <span style={{ display: 'block' }}>Moves Heaven.</span>
            </h2>

            <div style={{ width: 40, height: 1, background: '#C9A84C', marginBottom: 24 }} />

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.6)',
                marginBottom: 16,
              }}
            >
              Abolaji David Banjoko — known as BeeJay Sax — is one of Nigeria&apos;s most distinctive gospel
              saxophonists. His spirit-filled tone doesn&apos;t just fill rooms; it moves hearts.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.6)',
                marginBottom: 40,
              }}
            >
              A Mechanical Engineering graduate who traded blueprints for full-time ministry, BeeJay has graced stages
              alongside Donnie McClurkin, Nathaniel Bassey, and Travis Greene.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                borderTop: '1px solid #1E1E1E',
                paddingTop: 32,
                marginBottom: 40,
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
                    paddingLeft: i > 0 ? 24 : 0,
                    paddingRight: i < 2 ? 24 : 0,
                    borderRight: i < 2 ? '1px solid #1E1E1E' : 'none',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(36px,4vw,52px)',
                      fontWeight: 700,
                      color: '#C9A84C',
                      lineHeight: 1,
                      margin: '0 0 6px',
                    }}
                  >
                    {s.num}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#444',
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
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                textDecoration: 'none',
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
