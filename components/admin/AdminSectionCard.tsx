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
        border: '1px solid rgba(247,241,227,0.12)',
        background: '#1B1F4B',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          fontWeight: 600,
          color: '#F7F1E3',
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
            color: 'rgba(247,241,227,0.65)',
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
