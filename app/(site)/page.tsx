import Hero from '@/components/home/Hero'
import AboutTeaser from '@/components/home/AboutTeaser'
import FeaturedRelease from '@/components/home/FeaturedRelease'
import UpcomingEvents from '@/components/home/UpcomingEvents'
import VideoSection from '@/components/home/VideoSection'
import GalleryStrip from '@/components/home/GalleryStrip'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactCTA from '@/components/home/ContactCTA'
import { prisma } from '@/lib/prisma'
import { safeDb } from '@/lib/db-safe'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredRelease, upcomingEvents, featuredVideos, galleryImages] = await Promise.all([
    safeDb(
      () =>
        prisma.release.findFirst({
          where: { isFeatured: true },
          orderBy: { createdAt: 'desc' },
        }),
      null
    ),
    safeDb(
      () =>
        prisma.event.findMany({
          where: { status: 'UPCOMING' },
          orderBy: { eventDate: 'asc' },
          take: 3,
        }),
      []
    ),
    safeDb(
      () =>
        prisma.video.findMany({
          where: { isFeatured: true },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        }),
      []
    ),
    safeDb(
      () =>
        prisma.galleryImage.findMany({
          where: { category: 'PERFORMANCE' },
          orderBy: { sortOrder: 'asc' },
          take: 14,
        }),
      []
    ),
  ])

  return (
    <>
      <Hero />
      <AboutTeaser />
      <FeaturedRelease release={featuredRelease} />
      <UpcomingEvents events={upcomingEvents} />
      <VideoSection videos={featuredVideos} />
      <GalleryStrip images={galleryImages} />
      <TestimonialsSection />
      <ContactCTA />
    </>
  )
}
