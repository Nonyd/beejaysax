import LenisProvider from '@/components/providers/LenisProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CustomCursor from '@/components/layout/CustomCursor'
import BackToTop from '@/components/ui/BackToTop'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <CustomCursor />
      <Navbar />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <BackToTop />
    </LenisProvider>
  )
}
