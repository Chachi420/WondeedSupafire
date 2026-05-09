'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, fmtINR, fmtViews, FinalSplitCTA } from './shared'

function ClipperHeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 560 560" width="100%" height="100%">
        <defs>
          <pattern id="cg-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          </pattern>
        </defs>
        <circle cx="280" cy="280" r="240" fill="rgba(0,210,106,0.06)" />
        <g transform="translate(60, 110) rotate(-9 110 200)">
          <rect width="220" height="400" rx="38" fill="#0A0E27" stroke="#11163A" strokeWidth="2" />
          <rect x="10" y="10" width="200" height="380" rx="32" fill="#11163A" />
          <rect x="10" y="10" width="200" height="380" rx="32" fill="url(#cg-stripes)" />
          <rect x="86" y="18" width="48" height="8" rx="4" fill="#06091B" />
          <circle cx="110" cy="190" r="36" fill="rgba(255,255,255,0.95)" />
          <path d="M101 174 v32 l24 -16 z" fill="#0A0E27" />
          <rect x="22" y="320" width="124" height="14" rx="3" fill="rgba(255,255,255,0.7)" />
          <rect x="22" y="340" width="80" height="10" rx="3" fill="rgba(255,255,255,0.4)" />
          <circle cx="200" cy="332" r="10" fill="rgba(0,210,106,0.2)" />
        </g>
        <g transform="translate(290, 80)">
          <rect width="240" height="120" rx="18" fill="white" stroke="#ECECE6" />
          <text x="20" y="36" fontFamily="JetBrains Mono" fontSize="10" fill="#5A607A" letterSpacing="0.6" fontWeight="600">EARNINGS · OCT</text>
          <text x="20" y="80" fontFamily="Manrope" fontSize="36" fontWeight="800" fill="#0A0E27" letterSpacing="-1">₹12,840</text>
          <rect x="20" y="92" width="84" height="20" rx="10" fill="rgba(0,210,106,0.16)" />
          <text x="62" y="106" textAnchor="middle" fontFamily="Manrope" fontSize="11" fontWeight="700" fill="#00B85C">+₹2,180 this week</text>
          <rect x="160" y="40" width="10" height="56" rx="3" fill="#ECECE6" />
          <rect x="174" y="50" width="10" height="46" rx="3" fill="#ECECE6" />
          <rect x="188" y="34" width="10" height="62" rx="3" fill="#ECECE6" />
          <rect x="202" y="22" width="10" height="74" rx="3" fill="#0A0E27" />
          <rect x="216" y="44" width="10" height="52" rx="3" fill="#00D26A" />
        </g>
        <g transform="translate(330, 240)">
          <rect width="200" height="76" rx="14" fill="#0A0E27" />
          <circle cx="22" cy="38" r="14" fill="rgba(0,210,106,0.18)" />
          <path d="M16 36 v-4 m0 12 v4 m0 -8 a4 4 0 1 0 0 4" stroke="#00D26A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <text x="46" y="32" fontFamily="JetBrains Mono" fontSize="9" fill="#8087A6">UPI · just paid</text>
          <text x="46" y="54" fontFamily="Manrope" fontSize="18" fontWeight="800" fill="white">₹4,820 ↗</text>
        </g>
        <g transform="translate(80, 480)">
          <rect width="220" height="50" rx="14" fill="white" stroke="#ECECE6" />
          <circle cx="22" cy="25" r="6" fill="#00D26A" />
          <text x="42" y="22" fontFamily="JetBrains Mono" fontSize="9" fill="#5A607A" letterSpacing="0.5">VERIFIED VIEWS · LIVE</text>
          <text x="42" y="40" fontFamily="Manrope" fontSize="14" fontWeight="700" fill="#0A0E27">1,24,560 → 1,24,720</text>
        </g>
      </svg>
    </div>
  )
}

function ClippersHero() {
  const router = useRouter()

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> For Clippers</span>
            <h1 className="display-1" style={{ marginTop: 22 }}>
              Clip. Post.<br />
              <span style={{ color: 'var(--green-2)' }}>Get paid.</span>
            </h1>
            <p className="lead" style={{ marginTop: 28 }}>
              No agencies. No fixed-pay editing gigs. No follower minimum. Pick a campaign, cut a Reel or Short, post on your handle. Earn for every verified view via UPI.
            </p>
            <div className="hero-actions" style={{ marginTop: 36 }}>
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
                Sign up with phone <Icon name="arrow-right" />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => router.push('/login')}>
                See open campaigns
              </button>
            </div>
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--hairline)' }}>
              {([
                { tier: 'Standard', rate: '₹5',  per: 'per 1K views' },
                { tier: 'Medium',   rate: '₹7',  per: 'per 1K views' },
                { tier: 'High',     rate: '₹10', per: 'per 1K views' },
              ] as const).map((t, i) => (
                <div key={i} style={{
                  background: i === 2 ? 'var(--green)' : i === 1 ? 'var(--ink-2)' : 'var(--ink)',
                  padding: '20px 16px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === 2 ? 'rgba(10,14,39,0.6)' : 'var(--on-dark-mute)' }}>{t.tier}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 'clamp(22px, 2.8vw, 30px)', letterSpacing: '-0.03em', color: i === 2 ? 'var(--ink)' : 'white', lineHeight: 1 }}>{t.rate}</div>
                  <div style={{ fontSize: 11, color: i === 2 ? 'rgba(10,14,39,0.55)' : 'var(--on-dark-2)' }}>{t.per}</div>
                </div>
              ))}
            </div>
          </div>
          <ClipperHeroVisual />
        </div>
      </div>
    </section>
  )
}

function VsTable() {
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Better than fixed-pay gigs</span>
          <h2 className="display-2">Why this beats editing for ₹500 a clip.</h2>
        </div>
        <div className="vs-table">
          <div className="head row-label">{' '}</div>
          <div className="head">Editing gigs</div>
          <div className="head featured">Wondeed</div>
          <div className="row-label">Payment</div>
          <div>Fixed fee per video</div>
          <div className="featured" style={{ fontWeight: 600 }}>Per verified view, no ceiling</div>
          <div className="row-label">Earnings cap</div>
          <div>Capped by client budget</div>
          <div className="featured" style={{ fontWeight: 600 }}>Uncapped — viral clips earn for weeks</div>
          <div className="row-label">Contracts</div>
          <div>Email back-and-forth, retainers</div>
          <div className="featured" style={{ fontWeight: 600 }}>None. Pick any campaign, post, get paid.</div>
          <div className="row-label">Time to first earning</div>
          <div>15–30 days, after invoicing</div>
          <div className="featured" style={{ fontWeight: 600 }}>Within 7 days of verified views</div>
          <div className="row-label">Followers required</div>
          <div>Often 10K+ to be considered</div>
          <div className="featured" style={{ fontWeight: 600 }}>Zero. Even brand-new accounts.</div>
        </div>
      </div>
    </section>
  )
}

function PhoneStep({ idx }: { idx: number }) {
  return (
    <svg viewBox="0 0 200 160" width="78%" height="92%" style={{ marginTop: 8 }}>
      <rect x="62" y="14" width="76" height="142" rx="14" fill="#0A0E27" stroke="#1A2050" />
      <rect x="68" y="22" width="64" height="124" rx="10" fill="#11163A" />
      {idx === 0 && (<>
        <rect x="74" y="40" width="52" height="14" rx="3" fill="rgba(255,255,255,0.06)" />
        <text x="100" y="50" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="rgba(255,255,255,0.5)">+91 ___ ___ ___</text>
        <rect x="74" y="60" width="52" height="14" rx="3" fill="#00D26A" />
        <text x="100" y="70" textAnchor="middle" fontFamily="Manrope" fontSize="7" fontWeight="700" fill="#0A0E27">SEND OTP</text>
        <text x="100" y="100" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="rgba(255,255,255,0.4)">No email · No password</text>
      </>)}
      {idx === 1 && (<>
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(74, ${30 + i * 36})`}>
            <rect width="52" height="30" rx="4" fill="rgba(255,255,255,0.04)" />
            <rect x="4" y="4" width="14" height="22" rx="2" fill={i === 0 ? '#00D26A' : 'rgba(0,210,106,0.2)'} />
            <rect x="22" y="6" width="22" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
            <rect x="22" y="14" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
            <rect x="22" y="20" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
          </g>
        ))}
      </>)}
      {idx === 2 && (<>
        <rect x="74" y="30" width="52" height="80" rx="6" fill="rgba(0,210,106,0.16)" />
        <path d="M88 60 v20 l24 -10 z" fill="#00D26A" />
        <line x1="74" y1="116" x2="126" y2="116" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <circle cx="86" cy="116" r="3" fill="#00D26A" />
        <rect x="74" y="124" width="20" height="12" rx="2" fill="rgba(255,255,255,0.06)" />
        <rect x="98" y="124" width="28" height="12" rx="2" fill="#00D26A" />
      </>)}
      {idx === 3 && (<>
        <text x="100" y="50" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="rgba(255,255,255,0.5)">UPI PAYOUT</text>
        <text x="100" y="78" textAnchor="middle" fontFamily="Manrope" fontSize="14" fontWeight="800" fill="#00D26A">₹4,820</text>
        <rect x="74" y="92" width="52" height="22" rx="4" fill="rgba(0,210,106,0.16)" />
        <path d="M86 102 l4 4 8 -8" stroke="#00D26A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="106" y="106" fontFamily="Manrope" fontSize="6" fontWeight="700" fill="#00D26A">SETTLED</text>
      </>)}
    </svg>
  )
}

function ClipperHowItWorks() {
  const steps = [
    { n: '1', t: 'Sign up with phone', d: 'OTP login. Add UPI ID once. No email, no password, no resume.' },
    { n: '2', t: 'Pick a campaign', d: 'Browse open briefs by niche and earning tier. Download source pack.' },
    { n: '3', t: 'Edit and post', d: 'Cut a 15–60s Reel or Short on any editor. Post on your account.' },
    { n: '4', t: 'Get paid via UPI', d: 'Verified views become earnings. Payouts hit your UPI in 7 days.' },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> How it works</span>
          <h2 className="display-2" style={{ color: 'white' }}>Four steps. Phone-first.</h2>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-illus" style={{ display: 'grid', placeItems: 'center' }}>
                <PhoneStep idx={i} />
              </div>
              <div className="step-num">STEP {s.n}</div>
              <div className="step-title" style={{ color: 'white' }}>{s.t}</div>
              <p className="step-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EarningsCalculator() {
  const [tier, setTier]   = useState<'high' | 'medium' | 'standard'>('high')
  const [views, setViews] = useState(150000)

  const mult: Record<string, number> = { high: 0.01, medium: 0.007, standard: 0.005 }
  const earnings = Math.round(views * mult[tier])

  const tiers = [
    { id: 'high'     as const, label: 'High earning',     sub: 'Fintech, Stock, Crypto' },
    { id: 'medium'   as const, label: 'Medium earning',   sub: 'D2C, Beauty, EdTech' },
    { id: 'standard' as const, label: 'Standard earning', sub: 'Lifestyle, Apparel' },
  ]

  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Earnings calculator</span>
          <h2 className="display-2">See what one good clip can pay.</h2>
          <p className="lead">Drag the views slider. Pick a campaign type. We&apos;ll show you the earnings — no CPM math needed.</p>
        </div>
        <div className="calc-card">
          <div className="calc-inputs">
            <div>
              <div className="calc-label">Campaign type</div>
              <div className="calc-tier-row" style={{ marginTop: 12 }}>
                {tiers.map(t => (
                  <button key={t.id} className={`tier-pill ${tier === t.id ? 'active' : ''}`} onClick={() => setTier(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--fg-mute)' }}>
                {tiers.find(t => t.id === tier)?.sub}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="calc-label">Estimated views</span>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{fmtViews(views)}</span>
              </div>
              <input type="range" className="range" min={10000} max={1000000} step={10000}
                value={views} onChange={e => setViews(+e.target.value)} style={{ marginTop: 16 }} />
              <div className="range-row">
                <span>10K</span><span>1L</span><span>5L</span><span>10L</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-faint)', lineHeight: 1.5 }}>
              Earnings shown are for one clip on one platform. A typical clipper posts 5–15 clips a month across multiple campaigns.
            </div>
          </div>
          <div className="calc-output">
            <div className="calc-label">You&apos;d earn</div>
            <div className="calc-amt">{fmtINR(earnings)}<span className="small">/ clip</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16, color: 'var(--on-dark-2)', fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Verified views</span><b style={{ color: 'white' }}>{fmtViews(views)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Paid via</span><b style={{ color: 'white' }}>UPI · 7 days</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Minimum payout</span><b style={{ color: 'white' }}>₹500</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClipperRequirements() {
  const items = [
    { icon: 'instagram', t: 'Instagram or YouTube', d: 'A public account on either platform. Both is better.' },
    { icon: 'users', t: 'Any follower count', d: 'Yes, even zero. Volume of clips matters more than reach.' },
    { icon: 'sparkles', t: 'Basic editing skills', d: 'CapCut, InShot, VN — anything you already use.' },
    { icon: 'phone', t: 'Phone with UPI', d: 'Active Indian mobile number and a UPI ID for payouts.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 56, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <span className="eyebrow"><span className="dot" /> What you need</span>
            <h2 className="display-2" style={{ marginTop: 14 }}>Almost nothing.</h2>
            <p className="lead" style={{ marginTop: 16 }}>If you have a phone and you can use any video editor, you can clip on Wondeed.</p>
            <div style={{ marginTop: 32, padding: '24px 28px', background: 'var(--ink)', color: 'white', borderRadius: 18, display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.04em' }}>0</div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.015em' }}>Followers required</div>
                <div style={{ color: 'var(--on-dark-2)', fontSize: 14 }}>Brand-new accounts can join today.</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 320, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {items.map((it, i) => (
              <div className="card" key={i} style={{ padding: 22 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--ink)', marginBottom: 14 }}>
                  <Icon name={it.icon} width={18} height={18} />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.015em' }}>{it.t}</div>
                <p style={{ marginTop: 6, color: 'var(--fg-mute)', fontSize: 13.5, lineHeight: 1.5 }}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ClipperLadder() {
  const tiers = [
    { tag: 'Tier 1', name: 'New Clipper', t3: false, bullets: ['Access to standard-earning campaigns', 'Up to 3 active campaigns at a time', '14-day payout window', 'Basic content guidance'] },
    { tag: 'Tier 2', name: 'Verified', t3: false, bullets: ['Unlock medium-earning campaigns', 'Up to 8 active campaigns', '7-day payout window', 'Priority brief access', 'Bonus pool eligibility'] },
    { tag: 'Tier 3', name: 'Top Performer', t3: true, bullets: ['All campaigns including high-earning niches', 'Unlimited active campaigns', '3-day fast-track UPI payouts', 'Early-access drops & exclusives', 'Direct line to brand managers', 'Higher per-view rates'] },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Clipper tiers</span>
          <h2 className="display-2">A real ladder. Climbed by clips, not chats.</h2>
          <p className="lead">Move up by posting consistently and meeting view + quality thresholds. Higher tiers unlock better campaigns and faster payouts.</p>
        </div>
        <div className="ladder">
          {tiers.map((t, i) => (
            <div className={`ladder-card ${t.t3 ? 't3' : ''}`} key={i}>
              <div className="ladder-tier">{t.tag}</div>
              <div className="ttl">{t.name}</div>
              <div className="ladder-bullets">
                {t.bullets.map((b, j) => (
                  <div className="ladder-bullet" key={j}><Icon name="check" /><span>{b}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EarningsPotential() {
  const rows = [
    { label: '50,000 views',    std: 250,  med: 350,  high: 500  },
    { label: '1,00,000 views',  std: 500,  med: 700,  high: 1000  },
    { label: '5,00,000 views',  std: 2500, med: 3500, high: 5000 },
    { label: '10,00,000 views', std: 5000, med: 7000, high: 10000 },
  ]
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')
  return (
    <section className="section white">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <span className="eyebrow"><span className="dot" /> Earnings potential</span>
            <h2 className="display-2" style={{ marginTop: 14 }}>What one good clip can pay.</h2>
          </div>
          <span style={{ fontSize: 13, color: 'var(--fg-mute)', fontFamily: 'var(--mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Per verified view · no ceiling</span>
        </div>
        <div className="lb">
          <div className="lb-row head" style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr' }}>
            <span>Views on your clip</span>
            <span>Standard</span>
            <span>Medium</span>
            <span style={{ color: 'var(--green)' }}>High earning</span>
          </div>
          {rows.map((r, i) => (
            <div className="lb-row" key={i} style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr' }}>
              <span className="lb-handle">{r.label}</span>
              <span className="lb-num">{fmt(r.std)}</span>
              <span className="lb-num">{fmt(r.med)}</span>
              <span className="lb-num" style={{ color: 'var(--green-2)', fontWeight: 700 }}>{fmt(r.high)}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--fg-faint)', maxWidth: '72ch' }}>
          Rates: Standard ₹5 / 1K views · Medium ₹7 / 1K · High ₹10 / 1K. Actual rates vary by campaign. No ceiling — a viral clip keeps earning as long as views come in.
        </p>
      </div>
    </section>
  )
}

function ClipperFAQ() {
  const router = useRouter()
  const faqs = [
    { q: 'How and when do I get paid?', a: 'Verified views become earnings after a 72-hour holding period. Once you cross ₹500, request a payout — it lands in your UPI within 7 days. Tier 3 clippers get 3-day fast-track payouts.' },
    { q: 'What counts as a verified view?', a: 'Views counted by the official Instagram Graph API or YouTube Data API on your public Reel or Short, after our anomaly check. Watch-time floors apply on Shorts.' },
    { q: 'Do I need a minimum follower count?', a: 'No. Zero followers is fine. We don\'t care about your reach — we care about whether your clip gets views once it\'s out.' },
    { q: 'Can I submit clips to multiple campaigns?', a: 'Yes. You can have up to 3 active campaigns at Tier 1, 8 at Tier 2, and unlimited at Tier 3. Different clips, different campaigns, all earning together.' },
    { q: 'What if my clip gets removed by Instagram or YouTube?', a: 'Views earned before removal are still paid. Repeat removals can move you down a tier — keep your clips brand-safe and platform-compliant.' },
    { q: 'How do I move up clipper tiers?', a: 'Post consistently, hit the verified-view threshold for each tier, and keep your approval rate high. Tier moves are reviewed monthly.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Clipper FAQ</span>
          <h2 className="display-2">Everything new clippers ask.</h2>
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

function ClipperFinalCTA() {
  const router = useRouter()
  return (
    <section className="section dark">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="display-2" style={{ color: 'white', maxWidth: '22ch', margin: '0 auto' }}>
          Sign up in 30 seconds with your phone number.
        </h2>
        <p className="lead" style={{ marginTop: 20, marginInline: 'auto' }}>
          OTP login. Add UPI. Pick a campaign. That&apos;s the whole onboarding.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
            Start clipping <Icon name="arrow-right" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default function ClippersPage() {
  return (
    <>
      <ClippersHero />
      <VsTable />
      <ClipperHowItWorks />
      <EarningsCalculator />
      <ClipperRequirements />
      <ClipperLadder />
      <EarningsPotential />
      <ClipperFAQ />
      <ClipperFinalCTA />
    </>
  )
}
