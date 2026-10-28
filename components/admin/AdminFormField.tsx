interface AdminFormFieldProps {
  label: string
  children: React.ReactNode
  optional?: boolean
}

export default function AdminFormField({ label, children, optional }: AdminFormFieldProps) {
  return (
    <div>
      <label
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#E3B23C',
          display: 'block',
          marginBottom: 8,
        }}
      >
        {label}
        {optional && (
          <span
            style={{
              color: 'rgba(247,241,227,0.45)',
              marginLeft: 8,
              letterSpacing: 0,
              textTransform: 'none',
              fontSize: 10,
            }}
          >
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  )
}
