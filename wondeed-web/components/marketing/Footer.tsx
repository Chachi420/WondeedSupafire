'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'

export default function Footer() {
  const router = useRouter()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand"><span className="brand-mark">W</span><span>Wondeed</span></div>
            <p className="footer-tag">India&apos;s first performance-based short-form video clipping marketplace. Pay per view. Built in India.</p>
            <div className="footer-trust">
              <span className="trust-badge"><Icon name="shield-check" /> Razorpay Verified</span>
              <span className="trust-badge"><Icon name="badge-check" /> MSME Registered</span>
            </div>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a onClick={() => router.push('/brands')}>For Brands</a></li>
              <li><a onClick={() => router.push('/clippers')}>For Clippers</a></li>
              <li><a onClick={() => router.push('/pricing')}>Pricing</a></li>
              <li><a onClick={() => router.push('/trust')}>Trust &amp; Safety</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a>About</a></li>
              <li><a>Careers</a></li>
              <li><a>Blog</a></li>
              <li><a>Press</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a onClick={() => router.push('/faq')}>FAQ</a></li>
              <li><a>Help Center</a></li>
              <li><a>Creator Guide</a></li>
              <li><a>Brand Playbook</a></li>
              <li><a>API</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a>Terms</a></li>
              <li><a>Privacy</a></li>
              <li><a>Refund Policy</a></li>
              <li><a>GST Info</a></li>
              <li><a>Grievance Officer</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-strip">
          <div>© 2026 Wondeed Technologies Pvt. Ltd. · Made in India 🇮🇳</div>
          <div className="footer-socials">
            <a aria-label="Instagram"><Icon name="instagram" /></a>
            <a aria-label="YouTube"><Icon name="youtube" /></a>
            <a aria-label="X"><Icon name="twitter" /></a>
            <a aria-label="LinkedIn"><Icon name="linkedin" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
