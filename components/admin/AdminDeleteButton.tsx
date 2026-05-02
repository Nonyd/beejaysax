'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AdminDeleteButtonProps {
  endpoint: string
  label?: string
  confirmMessage?: string
}

export default function AdminDeleteButton({
  endpoint,
  label = 'Delete',
  confirmMessage = 'Are you sure you want to delete this? This cannot be undone.',
}: AdminDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deleted successfully')
        router.refresh()
      } else {
        toast.error('Delete failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-900/50 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-900/20 disabled:opacity-40"
      style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
    >
      {loading ? '...' : label}
    </button>
  )
}
