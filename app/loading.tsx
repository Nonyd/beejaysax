export default function GlobalLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-ink">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-ivory/15 border-t-gold" />
    </div>
  )
}
