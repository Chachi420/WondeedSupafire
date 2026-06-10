import Nav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'
import HomePage from '@/components/marketing/HomePage'
import ScrollReveal from '@/components/marketing/ScrollReveal'

export default function Home() {
  return (
    <div className="mkt-wrap">
      <Nav />
      <HomePage />
      <Footer />
      <ScrollReveal />
    </div>
  )
}
