'use client'

interface AdminToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}

export default function AdminToggle({ checked, onChange, label, description }: AdminToggleProps) {
  return (
    <div className="flex items-center justify-between border border-[#2A2A2A] px-4 py-3">
      <div>
        <p style={{ fontSize: 13, color: '#F5F0E8' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{description}</p>}
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
