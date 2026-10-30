import './globals.css'
import type { Metadata } from 'next'
import { gloock, hanken } from '@/lib/fonts'
import { getContent } from '@/lib/content/store'
import { themeInitScript } from '@/lib/theme'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo'

/** Site title, description and share image are edited in Admin → Website content → Search & sharing. */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getContent('seo')
  // An image set in the admin wins; otherwise the branded card in public/og.jpg.
  const images = [seo.shareImage ? { url: seo.shareImage, width: 1200, height: 630 } : DEFAULT_OG_IMAGE]
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: '%s | BeeJay Sax' },
    description: seo.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    keywords: ['BeeJay Sax', 'Beejay Sax', 'gospel saxophonist', 'Nigerian gospel saxophonist', 'Nigerian gospel music', 'music minister', 'Abolaji David Banjoko', 'Beejay Sax Live Concert'],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { title: seo.title, description: seo.description, url: '/', siteName: SITE_NAME, locale: 'en_NG', type: 'website', images },
    twitter: { card: 'summary_large_image', site: seo.twitter || undefined, creator: seo.twitter || undefined, images: images.map((i) => i.url) },
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gloock.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint; see lib/theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bjs-black font-sans text-bjs-white antialiased">{children}</body>
    </html>
  )
}
