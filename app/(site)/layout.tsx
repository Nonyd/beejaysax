import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/ui/BackToTop'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: '100vh' }}>{children}</main>
      <Footer />
      <BackToTop />
    </LenisProvider>
  )
}
