'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0F0F0F', color: '#F5F0E8', border: '1px solid #2A2A2A' },
        }}
      />
      {children}
    </SessionProvider>
  )
}
