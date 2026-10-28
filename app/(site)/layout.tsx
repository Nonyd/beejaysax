import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/ui/BackToTop'
import { getContent } from '@/lib/content/store'

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
