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
          They Say
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px,4vw,52px)',
            fontWeight: 600,
            lineHeight: 1.05,
            color: '#F5F0E8',
            margin: '0 0 64px',
          }}
        >
          The Sound Speaks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: '1px solid #1E1E1E' }}>
          {QUOTES.map((q, i) => (
            <div
              key={q.name}
              style={{
                padding: '48px 36px',
                position: 'relative',
                borderRight: i < 2 ? '1px solid #1E1E1E' : 'none',
              }}
              className={i < 2 ? 'border-b border-[#1E1E1E] md:border-b-0' : ''}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 24,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 72,
                  color: 'rgba(201,168,76,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                &quot;
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 17,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  color: 'rgba(245,240,232,0.8)',
                  marginBottom: 32,
                  position: 'relative',
                }}
              >
                &ldquo;{q.quote}&rdquo;
              </p>
              <div style={{ borderTop: '1px solid #1E1E1E', paddingTop: 24 }}>
                <div style={{ width: 24, height: 1, background: '#C9A84C', marginBottom: 10 }} />
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: '0 0 4px',
                  }}
                >
                  {q.name}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#444', margin: 0 }}>{q.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
