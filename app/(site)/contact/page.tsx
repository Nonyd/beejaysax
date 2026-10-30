import { Suspense } from 'react'
import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import { getContent } from '@/lib/content/store'

export const metadata: Metadata = {
  title: { absolute: 'Contact — BeeJay Sax' },
  description:
    'Book BeeJay Sax for concerts, gospel events, corporate functions, and collaborations. Get in touch with the team.',
  openGraph: {
    title: 'Contact BeeJay Sax',
    description: 'Available for bookings, collaborations, and media inquiries.',
    url: 'https://beejaysax.com/contact',
  },
}

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
