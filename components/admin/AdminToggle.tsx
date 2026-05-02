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
      className="flex items-start gap-4 border border-[#1E1E1E] bg-[#080808] px-4 py-3"
      style={{ maxWidth: '100%' }}
    >
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#F5F0E8', margin: 0 }}>
          {label}
        </p>
        {description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#666', margin: '6px 0 0', lineHeight: 1.45 }}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative transition-colors"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? '#C9A84C' : '#2A2A2A',
          flexShrink: 0,
        }}
      >
        <span
          className="absolute top-1 transition-transform"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: checked ? '#080808' : '#555',
            left: 4,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
