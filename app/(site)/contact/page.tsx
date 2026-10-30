import { Suspense } from 'react'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import ContactForm from './ContactForm'
import { getContent } from '@/lib/content/store'

export const metadata: Metadata = pageMetadata({
  title: 'Book BeeJay Sax — Contact',
  description: 'Book BeeJay Sax for concerts, church programmes, weddings, corporate events and collaborations. Get in touch with the team.',
  path: '/contact',
  shareTitle: 'Contact BeeJay Sax',
  shareDescription: 'Available for bookings, collaborations and media enquiries.',
})

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const [c, site] = await Promise.all([getContent('contact'), getContent('site')])
  return (
    <Suspense
      fallback={
        <div className="site-shell py-24 font-body text-ivory/60" role="status">
          Loading…
        </div>
      }
    >
      <ContactForm content={c} site={site} />
    </Suspense>
  )
}
