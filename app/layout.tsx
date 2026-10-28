import './globals.css'
import type { Metadata } from 'next'
import { gloock, hanken } from '@/lib/fonts'
import { getContent } from '@/lib/content/store'

/** Site title, description and share image are edited in Admin → Website content → Search & sharing. */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent('seo')
  const images = seo.shareImage ? [{ url: seo.shareImage, width: 1200, height: 630 }] : undefined
  return {
    metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beejaysax.com').replace(/\/$/, '')),
    title: { default: seo.title, template: '%s | BeeJay Sax' },
    description: seo.description,
    keywords: ['BeeJay Sax', 'gospel saxophonist', 'Nigerian gospel music', 'music minister', 'Abolaji David Banjoko'],
    openGraph: { title: seo.title, description: seo.description, url: '/', siteName: 'BeeJay Sax', type: 'website', images },
    twitter: { card: 'summary_large_image', creator: seo.twitter || undefined, images: images?.map((i) => i.url) },
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gloock.variable} ${hanken.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bjs-black font-sans text-bjs-white antialiased">{children}</body>
    </html>
  )
}
