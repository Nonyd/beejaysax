import { sectionLabelStyle } from '@/lib/typography-styles'

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808]">
      <div className="text-center">
        <div
          style={{
            width: 48,
            height: 48,
            border: '2px solid #1E1E1E',
            borderTop: '2px solid #C9A84C',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="mt-6" style={sectionLabelStyle}>
          Loading
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
