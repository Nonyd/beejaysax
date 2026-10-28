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
            background: '#1B1F4B',
            color: '#F7F1E3',
            border: '1px solid rgba(227,178,60,0.35)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
          },
        }}
      />
      {children}
    </SessionProvider>
  )
}
