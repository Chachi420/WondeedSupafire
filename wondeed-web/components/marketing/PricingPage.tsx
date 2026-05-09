'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, PricingCard, FinalSplitCTA, fmtINR } from './shared'

function PricingHero() {
  const router = useRouter()
  return (
    <section className="hero">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <span className="eyebrow"><span className="dot" /> Pricing</span>
          <h1 className="display-1" style={{ marginTop: 22 }}>Simple pricing for brands.</h1>
          <p className="lead" style={{ marginTop: 24, marginInline: 'auto', fontSize: 'clamp(18px, 1.8vw, 22px)' }}>
            <b style={{ color: 'var(--fg)' }}>100% of campaign budgets go to clippers.</b> Wondeed earns from subscriptions, never from your view payouts.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
              Start free with Pro <Icon name="arrow-right" />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => router.push('/login')}>
              Talk to sales
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingCards() {
  const router = useRouter()
  return (
    <section className="section paper" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="price-grid">
          <PricingCard
            tier="Pro" price="Free" per="forever"
            features={['1 active campaign', 'Tier 1 clipper access', '72-hour content approval', 'Standard support (48-hour response)', 'Razorpay-backed escrow wallet', 'GST-compliant invoices']}
            cta="Start free"
            onCta={() => router.push('/login')}
          />
          <PricingCard
            tier="Premium" price="₹8,000" per="/month"
            featured tag="Most popular"
            features={['5 active campaigns', 'Tier 1 + 2 clipper access', 'Custom do/don\'t rules per campaign', 'Daily view caps', 'Priority email support (24-hour SLA)', 'Monthly performance review call', 'Dedicated reporting dashboard']}
            cta="Choose Premium"
            onCta={() => router.push('/login')}
          />
          <PricingCard
            tier="Enterprise" price="₹20,000" per="/month"
            features={['Unlimited active campaigns', 'All clipper tiers (1, 2 & 3)', 'Dedicated success manager', 'Custom CPM rates on request', '4-hour SLA support', 'Quarterly business review', 'API access for analytics', 'White-glove onboarding']}
            cta="Talk to sales"
            onCta={() => router.push('/login')}
          />
        </div>
      </div>
    </section>
  )
}

function PricingTable() {
  type CellVal = boolean | string
  const Cell = ({ v }: { v: CellVal }) => {
    if (v === true) return <span className="check"><Icon name="check" /></span>
    if (v === false) return <span className="x">—</span>
    return <span>{v}</span>
  }
  const Row = ({ label, pro, premium, ent }: { label: string; pro: CellVal; premium: CellVal; ent: CellVal }) => (
    <tr>
      <td className="row-label">{label}</td>
      <td><Cell v={pro} /></td>
      <td className="featured-col"><Cell v={premium} /></td>
      <td><Cell v={ent} /></td>
    </tr>
  )
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Compare plans</span>
          <h2 className="display-2">Every feature, side by side.</h2>
        </div>
        <table className="cmp-table">
          <thead>
            <tr>
              <th>{' '}</th>
              <th><div className="ttl">Pro</div><div className="price">Free forever</div></th>
              <th className="featured-col"><div className="ttl">Premium</div><div className="price">₹8,000 / month</div></th>
              <th><div className="ttl">Enterprise</div><div className="price">₹20,000 / month</div></th>
            </tr>
          </thead>
          <tbody>
            <Row label="Active campaigns" pro="1" premium="5" ent="Unlimited" />
            <Row label="Clipper tier access" pro="Tier 1" premium="Tier 1 + 2" ent="All tiers" />
            <Row label="Content approval window" pro="72 hours" premium="72 hours" ent="Custom (24–96h)" />
            <Row label="Daily view caps" pro={false} premium={true} ent={true} />
            <Row label="Custom do/don't rules" pro="Standard" premium="Custom" ent="Custom + brand-locked" />
            <Row label="Niche targeting" pro={true} premium={true} ent={true} />
            <Row label="Performance dashboard" pro="Basic" premium="Advanced" ent="Advanced + API" />
            <Row label="Dedicated success manager" pro={false} premium={false} ent={true} />
            <Row label="Custom CPM rates" pro={false} premium={false} ent={true} />
            <Row label="Support SLA" pro="48 hours" premium="24 hours" ent="4 hours" />
            <Row label="Performance review" pro={false} premium="Monthly" ent="Quarterly + ad hoc" />
            <Row label="GST-compliant invoicing" pro={true} premium={true} ent={true} />
            <Row label="Refund on rejected clips" pro={true} premium={true} ent={true} />
          </tbody>
        </table>
      </div>
    </section>
  )
}

function WhatYouDontPay() {
  const items = [
    { t: 'No platform fee on payouts', d: '0% taken from clippers. 0% taken from your campaign budget. Razorpay UPI rails are absorbed by us.' },
    { t: 'No setup fees', d: 'Sign up, fund your wallet, run a campaign. No onboarding fee, no implementation cost.' },
    { t: 'No per-campaign charges', d: 'Run as many campaigns as your tier allows. The subscription is the only recurring cost.' },
    { t: 'No long-term contracts', d: 'Monthly billing on Premium and Enterprise. Cancel any time — wallet balance returns to your bank.' },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> What you don&apos;t pay</span>
          <h2 className="display-2" style={{ color: 'white' }}>The list of things we don&apos;t charge you for.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {items.map((it, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--hairline-dark-2)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green)', color: 'var(--ink)', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" width={18} height={18} />
              </div>
              <div className="display-4" style={{ color: 'white' }}>{it.t}</div>
              <p style={{ color: 'var(--on-dark-2)', fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCalculator() {
  const [budget, setBudget] = useState(50000)
  const fixedClippers = Math.max(8, Math.round(budget / 4500))

  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> The contrast</span>
          <h2 className="display-2">Subscription cost vs. traditional influencer spend.</h2>
          <p className="lead">A side-by-side at the same budget. Drag to compare.</p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 22, overflow: 'hidden' }}>
          <div style={{ padding: 32, borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', fontWeight: 600 }}>Your budget</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1, marginTop: 6 }}>{fmtINR(budget)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 240, maxWidth: 480 }}>
              <input type="range" className="range" min={20000} max={500000} step={5000}
                value={budget} onChange={e => setBudget(+e.target.value)} />
              <div className="range-row">
                <span>₹20K</span><span>₹1L</span><span>₹2.5L</span><span>₹5L</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 280 }}>
            <div style={{ padding: 32, borderRight: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', fontWeight: 600 }}>Traditional influencer post</div>
              <div className="display-3">{Math.max(1, Math.floor(budget / 45000))} post{Math.floor(budget / 45000) === 1 ? '' : 's'}</div>
              <p style={{ color: 'var(--fg-mute)', fontSize: 14, margin: 0 }}>Single creator. One go. Pay-up-front. Reach is whatever they get.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <li>· Fixed price agreed in advance</li>
                <li>· Refund unlikely if it flops</li>
                <li>· Paid before any view lands</li>
              </ul>
            </div>
            <div style={{ padding: 32, background: 'var(--ink)', color: 'white', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,210,106,0.18), transparent 70%)' }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 600, position: 'relative' }}>Same budget on Wondeed</div>
              <div className="display-3" style={{ color: 'white', position: 'relative' }}>{fixedClippers}+ clippers</div>
              <p style={{ color: 'var(--on-dark-2)', fontSize: 14, margin: 0, position: 'relative' }}>Distributed across niches. Per-view payouts. You only pay for verified views.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, position: 'relative', color: 'var(--on-dark-2)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" width={14} height={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> Pay only for verified views</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" width={14} height={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> 30+ different cuts on real handles</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" width={14} height={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> Unspent budget refundable</li>
              </ul>
            </div>
          </div>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--fg-faint)', maxWidth: '70ch' }}>
          Mid-tier influencer fee assumed at ₹45,000 per sponsored post. Clipper count on Wondeed is illustrative — actual count depends on niche and brief.
        </p>
      </div>
    </section>
  )
}

function PricingFAQ() {
  const faqs = [
    { q: 'How is the campaign budget held?', a: 'Funds sit in a Razorpay-backed escrow wallet under your account. Verified views deduct only after the 72-hour holding period. Unspent balance can be withdrawn back to your registered bank account anytime.' },
    { q: 'What if a clip gets no views?', a: 'You pay nothing. The clipper invested time but earned no payout. The clip can stay live; it might earn views later, in which case you\'d pay the verified-view rate at that time.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Premium and Enterprise are monthly. Cancel any time — your subscription continues until the end of the paid period, then stops. No early-termination fees.' },
    { q: 'Do unused campaigns roll over?', a: 'No. The active-campaign count resets each subscription period. But there\'s no "unused" cost — the subscription pays for unlimited use up to that count.' },
    { q: 'Can I upgrade or downgrade tiers?', a: 'Yes. Upgrades take effect immediately, prorated. Downgrades take effect at the next billing cycle.' },
    { q: 'Is GST included in the subscription price?', a: 'GST is added at the standard rate at checkout. We issue GST-compliant invoices monthly for input credit.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Pricing FAQ</span>
          <h2 className="display-2">Quick answers.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  )
}

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingCards />
      <PricingTable />
      <WhatYouDontPay />
      <PricingCalculator />
      <PricingFAQ />
      <FinalSplitCTA />
    </>
  )
}
