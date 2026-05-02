/** Centers admin forms so fields don’t stretch across ultra-wide viewports. */
export default function AdminFormShell({
  children,
  maxWidth = 800,
}: {
  children: React.ReactNode
  maxWidth?: number
}) {
  return (
    <div style={{ width: '100%', maxWidth, marginLeft: 'auto', marginRight: 'auto' }}>
      {children}
    </div>
  )
}
