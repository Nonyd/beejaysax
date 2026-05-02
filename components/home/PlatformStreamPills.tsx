'use client'

export default function PlatformStreamPills({
  platforms,
}: {
  platforms: { label: string; url: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {platforms.map((p) => (
        <a
          key={p.label}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#F5F0E8',
            border: '1px solid #2A2A2A',
            padding: '10px 18px',
            textDecoration: 'none',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#C9A84C'
            e.currentTarget.style.color = '#C9A84C'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2A2A2A'
            e.currentTarget.style.color = '#F5F0E8'
          }}
        >
          {p.label}
        </a>
      ))}
    </div>
  )
}
