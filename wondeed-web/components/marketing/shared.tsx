'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'

/* =========== Formatters =========== */

export function fmtINR(n: number): string {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(n >= 1e8 ? 0 : 2).replace(/\.0+$/, '') + ' Cr'
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(n >= 1e6 ? 0 : 2).replace(/\.0+$/, '') + ' L'
  if (n >= 1e3) return '₹' + Math.round(n / 1e3) + 'K'
  return '₹' + Math.round(n)
}

export function fmtViews(n: number): string {
  if (n >= 1e7) return (n / 1e7).toFixed(1).replace(/\.0$/, '') + ' Cr'
  if (n >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' L'
  if (n >= 1e3) return Math.round(n / 1e3) + 'K'
  return n.toString()
}

/* =========== FAQItem =========== */

interface FAQItemProps {
  q: string
  a: string
  defaultOpen?: boolean
}

export function FAQItem({ q, a, defaultOpen }: FAQItemProps) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-toggle"><Icon name={open ? 'minus' : 'plus'} /></span>
      </button>
      <div className="faq-a">{a}</div>
    </div>
  )
}

/* =========== PricingCard =========== */

interface PricingCardProps {
  tier: string
  price: string
  per: string
  features: string[]
  cta: string
  onCta: () => void
  featured?: boolean
  tag?: string
}

export function PricingCard({ tier, price, per, features, cta, onCta, featured, tag }: PricingCardProps) {
  return (
    <div className={`price-card ${featured ? 'featured' : ''}`}>
      {tag && <span className="price-tag">{tag}</span>}
      <div>
        <div className="price-tier">{tier}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 14 }}>
          <span className="price-amt">{price}<span className="per">{per}</span></span>
        </div>
      </div>
      <div className="price-features">
        {features.map((f, i) => (
          <div className="price-feature" key={i}>
            <Icon name="check" />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button className={featured ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'} onClick={onCta}>
        {cta} <Icon name="arrow-right" />
      </button>
    </div>
  )
}

/* =========== FinalSplitCTA =========== */

export function FinalSplitCTA() {
  const router = useRouter()
  return (
    <section className="section paper">
      <div className="container">
        <div className="split-cta">
          <div className="split-panel split-light">
            <div>
              <span className="eyebrow"><span className="dot" /> For Brands</span>
              <h3 className="display-3" style={{ marginTop: 16 }}>I want to run a campaign.</h3>
              <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>
                Deposit a budget. Get hundreds of clips made for you. Pay only for verified views.
              </p>
            </div>
            <div>
              <button className="btn btn-dark btn-lg" onClick={() => router.push('/login')}>
                Run your first campaign <Icon name="arrow-right" />
              </button>
              <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 10 }}>Minimum budget ₹20,000 · 100% goes to clippers</div>
            </div>
          </div>
          <div className="split-panel split-dark">
            <div>
              <span className="eyebrow"><span className="dot" /> For Clippers</span>
              <h3 className="display-3" style={{ marginTop: 16 }}>I want to clip and earn.</h3>
              <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>
                Pick a campaign. Edit. Post on your account. Get paid via UPI for every verified view.
              </p>
            </div>
            <div>
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
                Sign up with phone <Icon name="arrow-right" />
              </button>
              <div style={{ fontSize: 13, color: 'var(--on-dark-mute)', marginTop: 10 }}>0 followers needed · UPI payout in 7 days</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
