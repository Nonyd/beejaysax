const QUOTES = [
  {
    quote: 'BeeJay Sax carries a rare gift — when he plays, heaven draws near.',
    name: 'Pastor',
    role: 'Night of Worship',
  },
  {
    quote: "One of the most spirit-led saxophonists we've hosted at The Experience.",
    name: 'Event Organiser',
    role: 'The Experience',
  },
  {
    quote: "His Online Praise Party became our family's weekly sanctuary during lockdown.",
    name: 'Audience Member',
    role: 'United Kingdom',
  },
]

export default function TestimonialsSection() {
  return (
    <section style={{ background: '#0F0F0F', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
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
            They Say
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 600,
              lineHeight: 1.1,
              color: '#F5F0E8',
              margin: '0 0 16px',
            }}
          >
            The Sound Speaks
          </h2>
          <div style={{ height: 1, maxWidth: 120, background: '#C9A84C', margin: '0 auto', opacity: 0.45 }} />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ border: '1px solid #2A2A2A', background: 'rgba(8,8,8,0.35)' }}
        >
          {QUOTES.map((q, i) => (
            <div
              key={q.name}
              style={{
                padding: '40px 28px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
              className={
                i < 2 ? 'border-b border-[#2A2A2A] md:border-r md:border-b-0' : ''
              }
            >
              <span
                aria-hidden
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 64,
                  color: 'rgba(201,168,76,0.4)',
                  lineHeight: 0.6,
                  height: 28,
                  marginBottom: 12,
                  userSelect: 'none',
                }}
              >
                &ldquo;
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 19,
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  color: 'rgba(245,240,232,0.92)',
                  marginBottom: 28,
                  flex: 1,
                }}
              >
                {/* Upright "BeeJay": Playfair's italic J is a swash that reads as a 3 */}
                {q.quote.split('BeeJay').map((part, j) => (
                  <span key={j}>
                    {j > 0 && <span style={{ fontStyle: 'normal' }}>BeeJay</span>}
                    {part}
                  </span>
                ))}
              </p>
              <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 22 }}>
                <div style={{ width: 28, height: 2, background: '#C9A84C', marginBottom: 12 }} />
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: '0 0 6px',
                  }}
                >
                  {q.name}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#777', margin: 0 }}>{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
