import Link from 'next/link'

export default function ContactCTA() {
  return (
    <section style={{ background: '#080808', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="site-shell" style={{ textAlign: 'center' }}>
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
          Get In Touch
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px,7vw,96px)',
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}
        >
          <span style={{ display: 'block', color: '#F5F0E8' }}>Let&apos;s Create</span>
          <span style={{ display: 'block', color: '#C9A84C', fontStyle: 'italic' }}>Something Sacred.</span>
        </h2>

        <div style={{ width: 48, height: 2, background: '#C9A84C', margin: '28px auto', opacity: 0.65 }} />

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 17,
            lineHeight: 1.75,
            color: 'rgba(245,240,232,0.62)',
            maxWidth: 560,
            margin: '0 auto 40px',
          }}
        >
          Available for concerts, corporate events, gospel conferences, and collaborations — within Nigeria and
          internationally.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link
            href="/contact?inquiry=booking"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#080808',
              background: '#C9A84C',
              padding: '16px 40px',
              textDecoration: 'none',
              display: 'inline-block',
              minWidth: 200,
            }}
          >
            Book BeeJay
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#F5F0E8',
              background: 'transparent',
              border: '1px solid rgba(245,240,232,0.35)',
              padding: '16px 40px',
              textDecoration: 'none',
              display: 'inline-block',
              minWidth: 200,
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
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#777' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
