'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--ink)',
            color: 'var(--ivory)',
            border: '1px solid color-mix(in srgb, var(--gold) 35%, transparent)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
          },
        }}
      />
      {children}
    </SessionProvider>
  )
}
