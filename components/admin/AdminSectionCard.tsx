export default function AdminSectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        border: '1px solid #1E1E1E',
        background: '#0F0F0F',
        padding: '22px 26px',
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          fontWeight: 600,
          color: '#F5F0E8',
          margin: '0 0 6px',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      {description ? (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#777',
            margin: '0 0 20px',
            maxWidth: 560,
          }}
        >
          {description}
        </p>
      ) : (
        <div style={{ height: 14 }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
    </section>
  )
}
