'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, PricingCard, FinalSplitCTA } from './shared'

function BrandsHeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 560 560" width="100%" height="100%">
        <defs>
          <linearGradient id="bg-card" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#11163A" />
            <stop offset="1" stopColor="#0A0E27" />
          </linearGradient>
        </defs>
        <circle cx="280" cy="280" r="220" fill="rgba(0,210,106,0.05)" />
        <g transform="translate(60, 80)">
          <rect width="440" height="280" rx="22" fill="white" stroke="#ECECE6" />
          <rect x="24" y="24" width="120" height="14" rx="3" fill="#0A0E27" />
          <rect x="24" y="46" width="200" height="10" rx="3" fill="#5A607A" opacity="0.4" />
          <rect x="370" y="24" width="46" height="22" rx="11" fill="#00D26A" />
          <text x="393" y="38" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#0A0E27">LIVE</text>
          <text x="24" y="100" fontFamily="JetBrains Mono" fontSize="9" fill="#5A607A" letterSpacing="1">VERIFIED VIEWS · 30D</text>
          <text x="24" y="138" fontFamily="Manrope" fontSize="36" fontWeight="800" fill="#0A0E27" letterSpacing="-1">12,84,420</text>
          <polyline points="24,200 70,180 116,190 162,160 208,170 254,140 300,150 346,120 392,130 416,90" fill="none" stroke="#0A0E27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="24,200 70,180 116,190 162,160 208,170 254,140 300,150 346,120 392,130 416,90 416,232 24,232" fill="rgba(0,210,106,0.12)" stroke="none" />
          <circle cx="416" cy="90" r="5" fill="#00D26A" />
          <line x1="24" y1="232" x2="416" y2="232" stroke="#ECECE6" />
          <text x="24" y="252" fontFamily="JetBrains Mono" fontSize="9" fill="#5A607A">SPENT</text>
          <text x="24" y="270" fontFamily="Manrope" fontSize="16" fontWeight="700" fill="#0A0E27">₹1.84 L</text>
          <text x="160" y="252" fontFamily="JetBrains Mono" fontSize="9" fill="#5A607A">CLIPPERS</text>
          <text x="160" y="270" fontFamily="Manrope" fontSize="16" fontWeight="700" fill="#0A0E27">38</text>
          <text x="280" y="252" fontFamily="JetBrains Mono" fontSize="9" fill="#5A607A">CPM</text>
          <text x="280" y="270" fontFamily="Manrope" fontSize="16" fontWeight="700" fill="#00B85C">↘ 14%</text>
        </g>
        <g transform="translate(380, 380)">
          <rect width="156" height="68" rx="14" fill="#0A0E27" />
          <circle cx="20" cy="34" r="10" fill="#00D26A" />
          <text x="38" y="30" fontFamily="JetBrains Mono" fontSize="9" fill="#8087A6">@maya.edits</text>
          <text x="38" y="48" fontFamily="Manrope" fontSize="14" fontWeight="700" fill="white">+1.2L views</text>
        </g>
      </svg>
    </div>
  )
}

function BrandsHero() {
  const router = useRouter()
  return (
    <section className="hero dark">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> For Brands</span>
            <h1 className="display-1" style={{ marginTop: 22, color: 'white' }}>
              Stop paying for posts.<br />
              Start paying for <span style={{ color: 'var(--green)' }}>views</span>.
            </h1>
            <p className="lead" style={{ marginTop: 28 }}>
              Set a budget. Approve a brief. Hundreds of clippers turn your content into Reels and Shorts. You&apos;re charged only when each view is verified by Instagram or YouTube.
            </p>
            <div className="hero-actions" style={{ marginTop: 36 }}>
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
                Run your first campaign <Icon name="arrow-right" />
              </button>
              <button className="btn btn-ghost-dark btn-lg" onClick={() => router.push('/login')}>
                Talk to sales
              </button>
            </div>
          </div>
          <BrandsHeroVisual />
        </div>
      </div>
    </section>
  )
}

function BrandMath() {
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> The math is broken</span>
          <h2 className="display-2">Why influencer marketing keeps overcharging you.</h2>
          <p className="lead">A typical sponsored post in India is priced on follower count, not on results. The view rate is what actually matters — and it&apos;s almost always lower than the deck implies.</p>
        </div>
        <div className="math-row">
          <div className="math-cell">
            <div style={{ color: 'var(--fg-mute)', fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Avg sponsored post fee</div>
            <div className="math-num" style={{ marginTop: 8 }}>₹45,000</div>
            <div className="math-lbl">For one post on a mid-tier creator handle</div>
          </div>
          <div className="math-cell">
            <div style={{ color: 'var(--fg-mute)', fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Real view rate</div>
            <div className="math-num" style={{ marginTop: 8 }}>~6%</div>
            <div className="math-lbl">Of stated follower count actually watches</div>
          </div>
          <div className="math-cell contrast">
            <div style={{ fontSize: 13, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)' }}>Wondeed model</div>
            <div className="math-num" style={{ marginTop: 8, color: 'white' }}>0%</div>
            <div className="math-lbl" style={{ color: 'var(--green)' }}>Of your budget paid before views are verified</div>
          </div>
        </div>
        <p style={{ marginTop: 28, fontSize: 14, color: 'var(--fg-faint)', maxWidth: '70ch' }}>
          Industry medians from public influencer marketing reports across India, 2024–25.
        </p>
      </div>
    </section>
  )
}

function BrandHowItWorks() {
  const steps = [
    { n: '1', t: 'Deposit your budget', d: 'Add ₹20K or more via UPI, NEFT, RTGS or card. Funds sit in your Razorpay-backed escrow wallet.' },
    { n: '2', t: 'Upload source content', d: 'Drop in long-form videos, raw clips, ad scripts. We package a brief pack for clippers.' },
    { n: '3', t: 'Approve the brief', d: 'Set niche, daily caps, do/don\'t rules. Approve clips inside a 72-hour window before they go live.' },
    { n: '4', t: 'Clippers post on their handles', d: 'Real Instagram and YouTube creator accounts. Tracked by post URL with API verification.' },
    { n: '5', t: 'Pay only for views', d: 'Verified views deduct from your wallet after the holding period. No views, no charge.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> How it works</span>
          <h2 className="display-2">Five steps from budget to verified views.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => (
            <div className="card card-hover" key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ink)', color: 'var(--green)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{s.n}</span>
                <div style={{ width: 32, height: 1, background: 'var(--hairline-strong)' }} />
              </div>
              <div className="display-4">{s.t}</div>
              <p style={{ color: 'var(--fg-mute)', fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandControl() {
  const features = [
    { icon: 'shield-check', t: '72-hour content approval', d: 'Reject any clip before payout. Off-brand cuts never count against your budget.' },
    { icon: 'target', t: 'Niche targeting', d: 'Filter the clipper pool by niche, language and platform — fintech, beauty, edtech, more.' },
    { icon: 'wallet', t: 'Hard budget caps', d: 'Wallet stops deducting at zero. Set daily view caps so spend can\'t spike overnight.' },
    { icon: 'eye', t: 'Daily view caps', d: 'Throttle how fast a campaign can rack up paid views — useful during product flux.' },
    { icon: 'shield', t: 'Brand safety review', d: 'Manual review on every clipper\'s first submission per campaign. Auto-blocks for repeat offenders.' },
    { icon: 'badge-check', t: 'Real account verification', d: 'Clipper handles are verified through platform OAuth. Bot networks can\'t join.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Built for control</span>
          <h2 className="display-2">You stay in charge of every clip and every rupee.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div className="card card-hover" key={i}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--ink)', marginBottom: 16 }}>
                <Icon name={f.icon} width={20} height={20} />
              </div>
              <div className="display-4">{f.t}</div>
              <p style={{ marginTop: 10, color: 'var(--fg-mute)', fontSize: 14.5, lineHeight: 1.55 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandPricingTeaser() {
  const router = useRouter()
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Subscription tiers</span>
          <h2 className="display-2">Pick a tier. Run unlimited campaigns inside it.</h2>
          <p className="lead">Subscription unlocks the platform; campaign budgets are separate. 100% of every campaign budget goes to clippers.</p>
        </div>
        <div className="price-grid">
          <PricingCard
            tier="Pro" price="Free" per="forever"
            features={['1 active campaign', 'Tier 1 clipper access', '72-hour content approval', 'Standard support', 'Razorpay-backed escrow']}
            cta="Start free"
            onCta={() => router.push('/pricing')}
          />
          <PricingCard
            tier="Premium" price="₹8,000" per="/month"
            featured tag="Most popular"
            features={['5 active campaigns', 'Tier 1 + 2 clipper access', 'Custom do/don\'t rules', 'Daily view caps', 'Priority email support', 'Monthly performance review']}
            cta="Choose Premium"
            onCta={() => router.push('/pricing')}
          />
          <PricingCard
            tier="Enterprise" price="₹20,000" per="/month"
            features={['Unlimited campaigns', 'All clipper tiers', 'Dedicated success manager', 'Custom CPM rates on request', '24-hour SLA support', 'Quarterly business review', 'GST invoicing & TDS']}
            cta="Talk to sales"
            onCta={() => router.push('/pricing')}
          />
        </div>
      </div>
    </section>
  )
}

function BrandUseCases() {
  const cases = [
    { mark: 'Fi', niche: 'Fintech App Launch', budget: '₹50,000', brief: 'Onboarding flow demo + UPI rewards angle. Regional language clips welcome.' },
    { mark: 'Be', niche: 'D2C Beauty', budget: '₹2,00,000', brief: 'Hero product unboxing. Before/after textures. Indian skin tones, no filters.' },
    { mark: 'Ed', niche: 'EdTech Course', budget: '₹80,000', brief: 'Student-results angle. Subject-specific cuts (JEE, NEET, UPSC).' },
    { mark: 'Re', niche: 'Real Estate', budget: '₹1,50,000', brief: 'City-specific walkthroughs. Investment angle, not lifestyle.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Use cases</span>
          <h2 className="display-2">What brands actually run on Wondeed.</h2>
        </div>
        <div className="vert-grid">
          {cases.map((c, i) => (
            <div className="vert-card" key={i}>
              <div className="vert-mark">{c.mark}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{c.niche}</div>
                <div className="vert-budget" style={{ marginTop: 4 }}>{c.budget} typical budget</div>
              </div>
              <p style={{ color: 'var(--fg-mute)', fontSize: 14, lineHeight: 1.55, margin: 0, flex: 1 }}>{c.brief}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandFAQ() {
  const router = useRouter()
  const faqs = [
    { q: 'How is my campaign budget charged?', a: 'Funds sit in your Razorpay escrow wallet. Verified views are deducted only after the 72-hour holding period clears. You can withdraw an unspent balance anytime.' },
    { q: 'What happens if a clip gets zero views?', a: 'Nothing is charged. The clipper invested time but earned no payout. You owe nothing. This is the entire point of the model.' },
    { q: 'Which niches get the most clipper traction?', a: 'Fintech, D2C beauty, edtech and quick-commerce currently see the fastest clip pickup. Niche traction also depends on your earning tier and source content quality.' },
    { q: 'Can I see who\'s clipping for me?', a: 'Yes. Each campaign dashboard shows clipper handles, view counts, engagement, and clip URLs. You can block any clipper from your campaign in one click.' },
    { q: 'Do you handle GST invoicing?', a: 'Yes. Wondeed issues GST-compliant invoices for subscription fees. Razorpay handles the wallet top-ups separately.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Brand FAQ</span>
          <h2 className="display-2">Most asked, by brand teams.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={() => router.push('/faq')}>See full FAQ <Icon name="arrow-right" /></button>
        </div>
      </div>
    </section>
  )
}

function BrandFinalCTA() {
  const router = useRouter()
  return (
    <section className="section dark">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="display-2" style={{ color: 'white', maxWidth: '20ch', margin: '0 auto' }}>
          Run your first campaign for ₹20,000.
        </h2>
        <p className="lead" style={{ marginTop: 20, marginInline: 'auto' }}>
          Free Pro plan. Pay only for verified views. Cancel anytime — your unspent wallet returns to your bank.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
            Start free <Icon name="arrow-right" />
          </button>
          <button className="btn btn-ghost-dark btn-lg" onClick={() => router.push('/login')}>
            Talk to sales
          </button>
        </div>
      </div>
    </section>
  )
}

export default function BrandsPage() {
  return (
    <>
      <BrandsHero />
      <BrandMath />
      <BrandHowItWorks />
      <BrandControl />
      <BrandPricingTeaser />
      <BrandUseCases />
      <BrandFAQ />
      <BrandFinalCTA />
    </>
  )
}
