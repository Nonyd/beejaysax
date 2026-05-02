import Hero from '@/components/home/Hero'
import AboutTeaser from '@/components/home/AboutTeaser'
import FeaturedRelease from '@/components/home/FeaturedRelease'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import VideoSection from '@/components/home/VideoSection'
import GalleryStrip from '@/components/home/GalleryStrip'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactCTA from '@/components/home/ContactCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <FeaturedRelease />
      <UpcomingEvents />
      <VideoSection />
      <GalleryStrip />
      <TestimonialsSection />
      <ContactCTA />
    </>
  )
}
