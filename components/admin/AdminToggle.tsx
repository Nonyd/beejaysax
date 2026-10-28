'use client'

interface AdminToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}

export default function AdminToggle({ checked, onChange, label, description }: AdminToggleProps) {
  return (
    <div
      className="flex items-start gap-4 border border-[rgba(247,241,227,0.12)] bg-[#11142F] px-4 py-3"
      style={{ maxWidth: '100%' }}
    >
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#F7F1E3', margin: 0 }}>
          {label}
        </p>
        {description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(247,241,227,0.6)', margin: '6px 0 0', lineHeight: 1.45 }}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative transition-colors"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? '#E3B23C' : 'rgba(247,241,227,0.2)',
          flexShrink: 0,
        }}
      >
        <span
          className="absolute top-1 transition-transform"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: checked ? '#11142F' : 'rgba(247,241,227,0.55)',
            left: 4,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
