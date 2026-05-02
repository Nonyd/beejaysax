import Link from 'next/link'

export default function ContactCTA() {
  return (
    <section
      style={{
        background: '#080808',
        borderTop: '1px solid #1E1E1E',
        paddingTop: 140,
        paddingBottom: 140,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-16" style={{ textAlign: 'center' }}>
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
          GET IN TOUCH
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 'clamp(40px, 7vw, 96px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: '#F5F0E8',
            whiteSpace: 'nowrap',
            display: 'block',
            margin: 0,
          }}
        >
          Let&apos;s Create
        </h2>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 'clamp(40px, 7vw, 96px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: '#C9A84C',
            whiteSpace: 'nowrap',
            display: 'block',
            margin: '0 0 32px',
          }}
        >
          Something Sacred.
        </h2>

        <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '0 auto 32px' }} />

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            lineHeight: 1.8,
            color: 'rgba(245,240,232,0.5)',
            maxWidth: 480,
            margin: '0 auto 48px',
          }}
        >
          Available for concerts, corporate events, gospel conferences, and collaborations — within
          Nigeria and internationally.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 48,
          }}
        >
          <Link
            href="/contact?inquiry=booking"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: '#C9A84C',
              color: '#080808',
              padding: '14px 36px',
              minHeight: 44,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Book BeeJay
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: '#F5F0E8',
              border: '1px solid rgba(245,240,232,0.25)',
              padding: '14px 36px',
              minHeight: 44,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Send a Message
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '📍', text: 'Lagos, Nigeria' },
            { icon: '📞', text: '+234 80 5898 2828' },
            { icon: '✉️', text: 'booking@beejaysax.com' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, opacity: 0.6 }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#4A4A4A' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
