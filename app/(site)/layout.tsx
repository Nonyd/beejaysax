import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/ui/BackToTop'
import { getContent } from '@/lib/content/store'

// Public pages read events and editable content from the database on every request,
// so nothing is frozen at build time (CI builds have no access to the production DB).
export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getContent('site')
  return (
    <LenisProvider>
      <Navbar bookLabel={site.bookLabel} />
      <main style={{ paddingTop: 72, minHeight: '100vh' }}>{children}</main>
      <Footer />
      <BackToTop />
    </LenisProvider>
  )
}
