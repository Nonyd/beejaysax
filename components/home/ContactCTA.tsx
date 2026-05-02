import Link from 'next/link'

export default function ContactCTA() {
  return (
    <section style={{ background: '#080808', borderTop: '1px solid #1E1E1E', paddingTop: 120, paddingBottom: 120 }}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-12" style={{ textAlign: 'center' }}>
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

        <div style={{ width: 40, height: 1, background: '#C9A84C', margin: '32px auto' }} />

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
          Available for concerts, corporate events, gospel conferences, and collaborations — within Nigeria and
          internationally.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link
            href="/contact?inquiry=booking"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#080808',
              background: '#C9A84C',
              padding: '14px 36px',
              textDecoration: 'none',
              display: 'inline-block',
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
              color: '#F5F0E8',
              background: 'transparent',
              border: '1px solid rgba(245,240,232,0.25)',
              padding: '14px 36px',
              textDecoration: 'none',
              display: 'inline-block',
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
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#444' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
