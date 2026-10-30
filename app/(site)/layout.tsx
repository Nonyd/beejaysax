import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/ui/BackToTop'
import { PlayerProvider } from '@/components/player/PlayerProvider'
import MiniPlayer from '@/components/player/MiniPlayer'
import { getContent } from '@/lib/content/store'

// Public pages read events and editable content from the database, and CI builds have no access to
// the production DB, so every page must opt out of build-time rendering itself: either
// `dynamic = 'force-dynamic'`, or (event pages) a revalidate time with an empty generateStaticParams.

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getContent('site')
  return (
    <LenisProvider>
      {/* One preview player for the whole site, so music keeps playing between pages */}
      <PlayerProvider>
        <Navbar bookLabel={site.bookLabel} />
        <main style={{ paddingTop: 72, minHeight: '100vh' }}>{children}</main>
        <Footer />
        <BackToTop />
        <MiniPlayer />
      </PlayerProvider>
    </LenisProvider>
  )
}
