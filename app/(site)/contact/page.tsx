import { Suspense } from 'react'
import type { Metadata } from 'next'
import ContactForm from './ContactForm'

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

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-8 py-24 font-sans text-bjs-muted" role="status">
          Loading…
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  )
}
