import Hero from '@/components/home/Hero'
import AboutTeaser from '@/components/home/AboutTeaser'
import FeaturedRelease from '@/components/home/FeaturedRelease'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import Videos from '@/components/home/Videos'
import GalleryStrip from '@/components/home/GalleryStrip'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactCTA from '@/components/home/ContactCTA'
import JsonLd from '@/components/seo/JsonLd'
import { getContent } from '@/lib/content/store'
import { artistJsonLd, websiteJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// Rendered per request; see app/(site)/layout.tsx.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [seo, site] = await Promise.all([getContent('seo'), getContent('site')])
  return (
    <>
      <JsonLd data={[websiteJsonLd(seo.description), ...artistJsonLd({ description: seo.description, socials: site.socials })]} />
      <Hero />
      <AboutTeaser />
      <FeaturedRelease />
      <UpcomingEvents />
      <Videos />
      <GalleryStrip />
      <TestimonialsSection />
      <ContactCTA />
    </>
  )
}
