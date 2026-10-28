import './globals.css'
import type { Metadata } from 'next'
import { gloock, hanken } from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    default: 'BeeJay Sax — Gospel Saxophonist & Music Minister',
    template: '%s | BeeJay Sax',
  },
  description:
    'Official website of BeeJay Sax — Nigerian gospel saxophonist, convener of BeeJay Sax Live Concert, and music minister. Blessed & Highly Favoured.',
  keywords: ['BeeJay Sax', 'gospel saxophonist', 'Nigerian gospel music', 'music minister', 'Abolaji David Banjoko'],
  openGraph: {
    title: 'BeeJay Sax',
    description: 'Gospel Saxophonist · Music Minister · Blessed & Highly Favoured.',
    url: 'https://beejaysax.com',
    siteName: 'BeeJay Sax',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@beejaysaxbolaji',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gloock.variable} ${hanken.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bjs-black font-sans text-bjs-white antialiased">{children}</body>
    </html>
  )
}
