'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, FinalSplitCTA } from './shared'

function TrustHero() {
  return (
    <section className="hero dark">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <span className="eyebrow"><span className="dot" /> Trust &amp; Safety</span>
          <h1 className="display-1" style={{ marginTop: 22, color: 'white' }}>
            How Wondeed protects every <span style={{ color: 'var(--green)' }}>rupee</span> and every <span style={{ color: 'var(--green)' }}>view</span>.
          </h1>
          <p className="lead" style={{ marginTop: 24, marginInline: 'auto', fontSize: 'clamp(17px, 1.6vw, 20px)' }}>
            Performance-based marketing only works if both sides can trust the numbers. Here&apos;s exactly how view verification, content approval and payouts are protected — end to end.
          </p>
        </div>
      </div>
    </section>
  )
}

function TrustDiagram() {
  const stages: Array<{ x: number; label: string; sub: string; alt?: boolean; green?: boolean }> = [
    { x: 30,  label: 'Clipper posts on IG / YT', sub: 'Reel or Short URL' },
    { x: 230, label: 'Wondeed Tracker',           sub: 'API snapshots every 6h', alt: true },
    { x: 430, label: 'Anomaly Engine',             sub: 'Engagement-rate gates', alt: true },
    { x: 630, label: '72-hour Hold',               sub: 'Brand approval window', alt: true },
    { x: 830, label: 'UPI Payout',                 sub: 'Razorpay rails',        green: true },
  ]
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 22, padding: 32, overflowX: 'auto' }}>
      <svg viewBox="0 0 1000 220" style={{ width: '100%', minWidth: 720, height: 'auto', display: 'block' }}>
        <defs>
          <marker id="td-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#0A0E27" />
          </marker>
        </defs>
        {stages.map((n, i, arr) => (
          <g key={i}>
            <rect x={n.x} y="60" width="160" height="100" rx="14"
              fill={n.green ? '#00D26A' : (n.alt ? '#11163A' : '#FAFAF7')}
              stroke={n.alt || n.green ? 'none' : '#ECECE6'} strokeWidth="1" />
            <text x={n.x + 80} y="100" textAnchor="middle"
              fontFamily="Manrope" fontWeight="700" fontSize="14"
              fill={n.alt ? 'white' : '#0A0E27'} letterSpacing="-0.3">
              {n.label}
            </text>
            <text x={n.x + 80} y="124" textAnchor="middle"
              fontFamily="JetBrains Mono" fontSize="10"
              fill={n.alt ? 'rgba(255,255,255,0.6)' : '#5A607A'} letterSpacing="0.4">
              {n.sub}
            </text>
            {i < arr.length - 1 && (
              <line x1={n.x + 162} y1="110" x2={arr[i + 1].x - 4} y2="110"
                stroke="#0A0E27" strokeWidth="1.6" markerEnd="url(#td-arrow)" />
            )}
          </g>
        ))}
        <text x="30" y="40" fontFamily="JetBrains Mono" fontSize="10" fill="#5A607A" letterSpacing="0.6" fontWeight="600">VIEW PIPELINE</text>
      </svg>
    </div>
  )
}

function TrustVerification() {
  const layers = [
    { n: '1', t: 'Direct platform APIs', d: 'Views are pulled from the official Instagram Graph API and YouTube Data API. We never trust screenshots, never trust manual reports.' },
    { n: '2', t: 'Anomaly detection', d: 'Per-post snapshots track watch-time, engagement rate and view velocity. Patterns inconsistent with organic reach are flagged and held for review.' },
    { n: '3', t: '72-hour holding period', d: 'Verified views must clear a 72-hour hold before payout. Brands can dispute or reject inside this window. After clearance, payout is automatic.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> View verification</span>
          <h2 className="display-2">Three layers between a view and a payout.</h2>
          <p className="lead">No shortcuts. Every view that becomes earnings has passed all three checks.</p>
        </div>
        <div className="trust-flow">
          {layers.map((l, i) => (
            <div className="trust-step" key={i}>
              <div className="num">{l.n}</div>
              <h4>{l.t}</h4>
              <p>{l.d}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <TrustDiagram />
        </div>
      </div>
    </section>
  )
}

function TrustForBrands() {
  const cards = [
    { icon: 'shield-check', t: 'Content approval window', d: '72 hours to review every clip before it gets paid. Reject anything that doesn\'t fit and the payout is reversed automatically.' },
    { icon: 'flag', t: 'Brand safety review', d: 'Every clipper\'s first submission per campaign goes through manual review. Repeat offenders are auto-blocked from your campaigns.' },
    { icon: 'wallet', t: 'Refund on rejected clips', d: 'Reject a clip → its views never deduct from your wallet. Refunds are instant inside the holding period.' },
    { icon: 'lock', t: 'Escrow wallet model', d: 'Funds sit in a Razorpay-backed escrow against your account. We move money only after each view passes all three verification layers.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> For Brands</span>
          <h2 className="display-2">Protections built into every campaign.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {cards.map((c, i) => (
            <div className="card" key={i}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--ink)', marginBottom: 14 }}>
                <Icon name={c.icon} width={20} height={20} />
              </div>
              <div className="display-4">{c.t}</div>
              <p style={{ marginTop: 8, color: 'var(--fg-mute)', fontSize: 14.5, lineHeight: 1.55 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustForClippers() {
  const cards = [
    { icon: 'lock', t: 'Locked-in rates at campaign start', d: 'The earning tier when you join a campaign is the rate you\'re paid for the duration. We can\'t change it mid-flight.' },
    { icon: 'wallet', t: 'Guaranteed UPI payouts', d: 'Once views are verified and held, your earnings are released. UPI within 7 days. Tier 3 clippers get 3-day fast-track.' },
    { icon: 'badge-check', t: 'Dispute resolution', d: 'Disagree with a rejection? Open a dispute. A second-pair-of-eyes review settles it within 48 hours. Win-rate goes into your record.' },
    { icon: 'shield', t: 'Account protection', d: 'Your social handles aren\'t shared with brands without your consent. Direct messages from brands are gated behind opt-in.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> For Clippers</span>
          <h2 className="display-2">You earn what you earn — full stop.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {cards.map((c, i) => (
            <div className="card" key={i}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink)', color: 'var(--green)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                <Icon name={c.icon} width={20} height={20} />
              </div>
              <div className="display-4">{c.t}</div>
              <p style={{ marginTop: 8, color: 'var(--fg-mute)', fontSize: 14.5, lineHeight: 1.55 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustCompliance() {
  const items = [
    { t: 'Razorpay payment partner', d: 'All wallets and payouts are processed via Razorpay. PCI-DSS compliant. Indian banking regulations honoured.' },
    { t: 'GST-compliant invoicing', d: 'Subscription invoices include GSTIN, HSN code and breakdown. Eligible for input tax credit.' },
    { t: 'MeitY content moderation', d: 'Wondeed follows MeitY guidelines for intermediary platforms. Grievance officer is publicly listed.' },
    { t: 'Data residency in India', d: 'User data, campaign content and payment logs are stored on Indian-region cloud infrastructure.' },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Compliance</span>
          <h2 className="display-2" style={{ color: 'white' }}>The boring stuff we take seriously.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {items.map((it, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--hairline-dark-2)', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Icon name="shield-check" width={22} height={22} style={{ color: 'var(--green)' }} />
              <div className="display-4" style={{ color: 'white', marginTop: 8 }}>{it.t}</div>
              <p style={{ color: 'var(--on-dark-2)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustContact() {
  return (
    <section className="section white">
      <div className="container">
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--hairline)',
          borderRadius: 24,
          padding: 'clamp(32px, 5vw, 56px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          alignItems: 'center',
        }}>
          <div>
            <span className="eyebrow"><span className="dot" /> Trust issues? Talk to us.</span>
            <h3 className="display-3" style={{ marginTop: 14 }}>A real human, within 24 hours.</h3>
            <p style={{ color: 'var(--fg-mute)', fontSize: 16, marginTop: 12, maxWidth: '50ch' }}>
              For disputes, suspicious view patterns, or anything that doesn&apos;t feel right — write to our trust desk. We respond within one working day, weekdays IST.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>Trust desk email</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, marginTop: 6 }}>trust@wondeed.com</div>
              <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 4 }}>Response SLA · 24 working hours</div>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>Grievance officer</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, marginTop: 6 }}>grievance@wondeed.com</div>
              <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 4 }}>Per MeitY intermediary guidelines</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function TrustPage() {
  return (
    <>
      <TrustHero />
      <TrustVerification />
      <TrustForBrands />
      <TrustForClippers />
      <TrustCompliance />
      <TrustContact />
      <FinalSplitCTA />
    </>
  )
}
