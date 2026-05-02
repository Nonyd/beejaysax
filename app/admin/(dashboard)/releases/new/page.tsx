import ReleaseForm from '@/components/admin/ReleaseForm'

export default function NewReleasePage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#F5F0E8', marginBottom: 4 }}>
        New Release
      </h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>Add a single, album, or EP</p>
      <ReleaseForm mode="create" />
    </div>
  )
}
