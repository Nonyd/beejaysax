import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4">
      <div className="max-w-lg text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(120px, 20vw, 220px)',
            color: '#C9A84C',
            lineHeight: 1,
            opacity: 0.08,
            userSelect: 'none',
            marginBottom: -40,
          }}
        >
          404
        </p>

        <p className="section-label mb-6">Page not found</p>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            color: '#F5F0E8',
            lineHeight: 0.9,
            marginBottom: 24,
          }}
        >
          This page
          <br />
          <em style={{ color: '#C9A84C' }}>doesn&apos;t exist.</em>
        </h1>

        <p
          style={{
            color: '#555',
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 360,
            margin: '0 auto 40px',
          }}
        >
          The page you&apos;re looking for may have been moved, deleted, or never existed. Let&apos;s get you back to the music.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-[#C9A84C] px-6 py-3 font-semibold text-[#080808] transition hover:bg-[#E8C96D]"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Go Home
          </Link>
          <Link
            href="/events"
            className="border border-[#2A2A2A] px-6 py-3 text-white transition hover:border-[#C9A84C]"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            View Events
          </Link>
          <Link
            href="/releases"
            className="border border-[#2A2A2A] px-6 py-3 text-white transition hover:border-[#C9A84C]"
            style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Listen Now
          </Link>
        </div>

        <p style={{ fontSize: 64, marginTop: 60, opacity: 0.06 }}>🎷</p>
      </div>
    </div>
  )
}
