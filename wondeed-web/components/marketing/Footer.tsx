'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'
import BrandMark from '@/components/BrandMark'

export default function Footer() {
  const router = useRouter()
  const go = (path: string) => () => router.push(path)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand"><BrandMark size={28} /><span>Wondeed</span></div>
            <p className="footer-tag">India&apos;s first performance-based short-form video clipping marketplace. Pay per view. Built in India.</p>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a onClick={go('/brands')}>For Brands</a></li>
              <li><a onClick={go('/clippers')}>For Clippers</a></li>
              <li><a onClick={go('/pricing')}>Pricing</a></li>
              <li><a onClick={go('/trust')}>Trust &amp; Safety</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a onClick={go('/about')}>About</a></li>
              <li><a onClick={go('/careers')}>Careers</a></li>
              <li><a onClick={go('/blog')}>Blog</a></li>
              <li><a onClick={go('/press')}>Press</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a onClick={go('/faq')}>FAQ</a></li>
              <li><a onClick={go('/help')}>Help Center</a></li>
              <li><a onClick={go('/creator-guide')}>Creator Guide</a></li>
              <li><a onClick={go('/brand-playbook')}>Brand Playbook</a></li>
              <li><a onClick={go('/developers')}>API</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a onClick={go('/terms')}>Terms</a></li>
              <li><a onClick={go('/privacy')}>Privacy</a></li>
              <li><a onClick={go('/refund')}>Refund Policy</a></li>
              <li><a onClick={go('/gst')}>GST Info</a></li>
              <li><a onClick={go('/grievance')}>Grievance Officer</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-strip">
          <div>© 2026 Wondeed · Made in India 🇮🇳</div>
          <div className="footer-socials">
            <a href="https://instagram.com/wondeed" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
            <a href="https://youtube.com/@wondeed" target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a>
            <a href="https://twitter.com/wondeed" target="_blank" rel="noreferrer" aria-label="X"><Icon name="twitter" /></a>
            <a href="https://linkedin.com/company/wondeed" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
