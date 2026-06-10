import Nav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'
import ScrollReveal from '@/components/marketing/ScrollReveal'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt-wrap">
      <Nav />
      {children}
      <Footer />
      <ScrollReveal />
    </div>
  )
}
