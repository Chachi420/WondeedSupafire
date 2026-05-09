'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, fmtINR, FinalSplitCTA } from './shared'

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 560 560" width="100%" height="100%">
        <defs>
          <linearGradient id="hg-grad-1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#11163A" />
            <stop offset="1" stopColor="#0A0E27" />
          </linearGradient>
          <linearGradient id="hg-grad-2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FAFAF7" />
            <stop offset="1" stopColor="#ECECE6" />
          </linearGradient>
          <pattern id="hg-stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          </pattern>
        </defs>
        <circle cx="290" cy="280" r="240" fill="rgba(0,210,106,0.06)" />
        <circle cx="290" cy="280" r="180" fill="rgba(0,210,106,0.08)" />
        <g transform="translate(40, 80) rotate(-6 180 140)">
          <rect width="320" height="220" rx="22" fill="white" stroke="#ECECE6" />
          <rect x="20" y="20" width="280" height="120" rx="12" fill="url(#hg-grad-1)" />
          <rect x="20" y="20" width="280" height="120" rx="12" fill="url(#hg-stripes)" />
          <rect x="32" y="32" width="92" height="22" rx="11" fill="rgba(255,255,255,0.94)" />
          <circle cx="42" cy="43" r="3" fill="#00D26A" />
          <text x="50" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#0A0E27" letterSpacing="0.6">LIVE · D2C</text>
          <text x="20" y="170" fontFamily="Manrope, sans-serif" fontSize="18" fontWeight="700" fill="#0A0E27">Glow Beauty Launch</text>
          <rect x="20" y="184" width="280" height="6" rx="3" fill="#F0EFE9" />
          <rect x="20" y="184" width="184" height="6" rx="3" fill="#0A0E27" />
          <text x="20" y="208" fontFamily="Inter, sans-serif" fontSize="11" fill="#5A607A">₹1.2L of ₹2L · 38 clippers · 6d left</text>
        </g>
        <g transform="translate(280, 130) rotate(8 90 180)">
          <rect width="200" height="360" rx="34" fill="#0A0E27" stroke="#11163A" strokeWidth="2" />
          <rect x="8" y="8" width="184" height="344" rx="28" fill="url(#hg-grad-1)" />
          <rect x="8" y="8" width="184" height="344" rx="28" fill="url(#hg-stripes)" />
          <rect x="78" y="14" width="44" height="8" rx="4" fill="#06091B" />
          <circle cx="100" cy="170" r="32" fill="rgba(255,255,255,0.95)" />
          <path d="M93 156 v28 l22 -14 z" fill="#0A0E27" />
          <rect x="20" y="290" width="160" height="48" rx="10" fill="rgba(0,0,0,0.5)" />
          <text x="32" y="312" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#00D26A" letterSpacing="0.8" fontWeight="700">VERIFIED VIEWS</text>
          <text x="32" y="330" fontFamily="Manrope, sans-serif" fontSize="18" fontWeight="700" fill="white">1,24,560</text>
        </g>
        <g transform="translate(80, 380)">
          <rect width="200" height="76" rx="16" fill="white" stroke="#ECECE6" />
          <rect x="14" y="14" width="36" height="36" rx="10" fill="#0A0E27" />
          <path d="M30 28 v-4 m0 14 v4 m0 -10 a6 6 0 1 0 0 6" stroke="#00D26A" strokeWidth="2" strokeLinecap="round" fill="none" />
          <text x="62" y="32" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#5A607A" letterSpacing="0.6" fontWeight="600">UPI PAYOUT</text>
          <text x="62" y="54" fontFamily="Manrope, sans-serif" fontSize="20" fontWeight="700" fill="#0A0E27">₹4,820</text>
          <text x="155" y="54" fontFamily="Inter, sans-serif" fontSize="11" fill="#00B85C">+18%</text>
        </g>
      </svg>
    </div>
  )
}

function MarketplaceLoop() {
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> The marketplace</span>
          <h2 className="display-2">Two sides. One loop.</h2>
          <p className="lead">Brands fund campaigns. Clippers turn that content into Reels and Shorts. Brands pay only for verified views — 100% of the budget reaches the clippers.</p>
        </div>
        <div className="two-sides">
          <div className="side-panel side-brand">
            <span className="side-tag">Brand side</span>
            <h3 className="display-3" style={{ marginTop: 16, marginBottom: 12 }}>Fund a budget.<br />Set the brief.</h3>
            <p style={{ color: 'var(--fg-mute)', fontSize: 15, marginTop: 0, maxWidth: '40ch' }}>
              Deposit ₹20K or ₹2L into your campaign wallet. Approve the source clips and rules. Sit back.
            </p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Campaign brief', r: 'Approved' },
                { l: 'Wallet balance', r: '₹1,80,500' },
                { l: 'Clippers joined', r: '38' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--hairline)' : 'none', fontSize: 14 }}>
                  <span style={{ color: 'var(--fg-mute)' }}>{row.l}</span>
                  <span style={{ fontWeight: 600 }}>{row.r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="side-divider">
            <span className="puck"><Icon name="arrow-right" width={22} height={22} /></span>
          </div>
          <div className="side-panel side-clipper">
            <span className="side-tag">Clipper side</span>
            <h3 className="display-3" style={{ marginTop: 16, marginBottom: 12, color: 'white' }}>Edit. Post.<br />Get paid by UPI.</h3>
            <p style={{ color: 'var(--on-dark-2)', fontSize: 15, marginTop: 0, maxWidth: '40ch' }}>
              Pick any open campaign. Cut a Reel or Short. Post it on your handle. Earn for every verified view.
            </p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Clip posted', r: '@arjun.cuts' },
                { l: 'Verified views', r: '1,24,560' },
                { l: 'Earned this month', r: '₹4,820' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', fontSize: 14 }}>
                  <span style={{ color: 'var(--on-dark-2)' }}>{row.l}</span>
                  <span style={{ fontWeight: 600, color: i === 2 ? 'var(--green)' : 'white' }}>{row.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LiveCampaignsTeaser() {
  const router = useRouter()
  const cards = [
    { niche: 'Fintech App', tier: 'High earning', budget: 200000, spent: 124000, days: 8, clippers: 42, var: '' },
    { niche: 'D2C Beauty', tier: 'High earning', budget: 150000, spent: 38000, days: 12, clippers: 18, var: 'var-2' },
    { niche: 'EdTech', tier: 'Medium earning', budget: 80000, spent: 24000, days: 6, clippers: 11, var: 'var-3' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <span className="eyebrow"><span className="dot" /> Live campaigns</span>
            <h2 className="display-2" style={{ marginTop: 14 }}>Real briefs.<br />Open to clip right now.</h2>
          </div>
          <button className="btn btn-ghost" onClick={() => router.push('/login')}>
            See all campaigns <Icon name="arrow-right" />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {cards.map((c, i) => (
            <button key={i} className="cmp-card" onClick={() => router.push('/login')}>
              <div className={`cmp-thumb ${c.var}`}>
                <span className="cmp-pill"><span className="dot" />{c.tier}</span>
              </div>
              <div className="cmp-row">
                <div>
                  <div className="cmp-niche">{c.niche}</div>
                  <div className="cmp-title" style={{ marginTop: 4 }}>Campaign #{1240 + i}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="cmp-niche">Days left</div>
                  <div className="cmp-title" style={{ marginTop: 4 }}>{c.days}</div>
                </div>
              </div>
              <div>
                <div className="cmp-bar"><div style={{ width: `${(c.spent / c.budget) * 100}%` }} /></div>
                <div className="cmp-meta" style={{ marginTop: 8 }}>
                  <span><b>{fmtINR(c.budget - c.spent)}</b> remaining</span>
                  <span>of {fmtINR(c.budget)}</span>
                </div>
              </div>
              <div className="cmp-foot">
                <div className="cmp-clippers">
                  <div className="av-stack">
                    <span className="av">A</span><span className="av">M</span><span className="av">S</span><span className="av">+</span>
                  </div>
                  <span>{c.clippers} clippers joined</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Join <Icon name="arrow-right" width={12} height={12} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepArt({ kind, idx }: { kind: string; idx: number }) {
  if (kind === 'brand') {
    if (idx === 0) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <rect x="30" y="40" width="140" height="80" rx="14" fill="#11163A" stroke="#1A2050" />
        <rect x="44" y="56" width="60" height="10" rx="5" fill="rgba(255,255,255,0.4)" />
        <rect x="44" y="74" width="100" height="22" rx="6" fill="#00D26A" />
        <text x="94" y="89" textAnchor="middle" fontFamily="Manrope" fontSize="11" fontWeight="700" fill="#0A0E27">₹2,00,000</text>
        <circle cx="160" cy="60" r="14" fill="rgba(0,210,106,0.2)" />
      </svg>
    )
    if (idx === 1) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <rect x="40" y="38" width="56" height="84" rx="10" fill="#11163A" stroke="#1A2050" />
        <rect x="50" y="50" width="36" height="48" rx="4" fill="rgba(0,210,106,0.3)" />
        <path d="M62 68 v16 l14 -8 z" fill="#00D26A" />
        <rect x="104" y="38" width="56" height="84" rx="10" fill="#11163A" stroke="#1A2050" />
        <rect x="114" y="50" width="36" height="48" rx="4" fill="rgba(255,255,255,0.1)" />
        <line x1="120" y1="74" x2="142" y2="74" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      </svg>
    )
    if (idx === 2) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(${30 + i * 50}, 40)`}>
            <rect width="40" height="80" rx="6" fill="#11163A" />
            {i === 0 && <circle cx="20" cy="68" r="10" fill="#00D26A" />}
            {i === 0 && <path d="M16 68 l3 4 6 -8" stroke="#0A0E27" strokeWidth="2" fill="none" strokeLinecap="round" />}
            {i !== 0 && <rect x="10" y="58" width="20" height="20" rx="10" fill="rgba(255,255,255,0.1)" />}
          </g>
        ))}
      </svg>
    )
    return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <polyline points="20,120 50,90 80,100 110,60 140,72 180,30" fill="none" stroke="#00D26A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="180" cy="30" r="6" fill="#00D26A" />
        <text x="20" y="140" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="0.5">VERIFIED VIEWS · 30D</text>
      </svg>
    )
  }
  if (idx === 0) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="62" y="24" width="76" height="120" rx="14" fill="#11163A" stroke="#1A2050" />
      <rect x="70" y="46" width="60" height="22" rx="6" fill="rgba(255,255,255,0.06)" />
      <text x="100" y="60" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(255,255,255,0.6)">+91 ___ ___ ___</text>
      <rect x="70" y="76" width="60" height="22" rx="6" fill="#00D26A" />
      <text x="100" y="90" textAnchor="middle" fontFamily="Manrope" fontSize="10" fontWeight="700" fill="#0A0E27">SEND OTP</text>
    </svg>
  )
  if (idx === 1) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      {[0, 1].map(i => (
        <g key={i} transform={`translate(${30 + i * 70}, 30)`}>
          <rect width="68" height="100" rx="10" fill="#11163A" />
          <rect x="10" y="10" width="48" height="50" rx="4" fill="rgba(0,210,106,0.18)" />
          <path d="M30 30 v12 l10 -6 z" fill="#00D26A" />
          <rect x="10" y="68" width="40" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
          <rect x="10" y="80" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />
        </g>
      ))}
    </svg>
  )
  if (idx === 2) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="36" y="24" width="128" height="112" rx="12" fill="#11163A" stroke="#1A2050" />
      <rect x="46" y="34" width="108" height="64" rx="6" fill="rgba(0,210,106,0.18)" />
      <path d="M86 56 v20 l24 -10 z" fill="#00D26A" />
      <line x1="46" y1="110" x2="154" y2="110" stroke="rgba(255,255,255,0.2)" />
      <line x1="80" y1="110" x2="80" y2="100" stroke="#00D26A" strokeWidth="3" />
    </svg>
  )
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="40" y="40" width="120" height="80" rx="14" fill="#11163A" stroke="#1A2050" />
      <rect x="54" y="56" width="42" height="14" rx="3" fill="rgba(255,255,255,0.5)" />
      <text x="54" y="93" fontFamily="Manrope" fontSize="22" fontWeight="800" fill="#00D26A">₹4,820</text>
      <circle cx="138" cy="60" r="14" fill="#00D26A" />
      <path d="M134 60 l3 3 6 -7" stroke="#0A0E27" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function HowItWorksTabs() {
  const [tab, setTab] = useState<'brand' | 'clipper'>('brand')
  const brandSteps = [
    { num: '01', t: 'Deposit a budget', d: 'Add ₹20K or more to your campaign wallet via UPI, NEFT or card. Funds stay in escrow until views are verified.' },
    { num: '02', t: 'Upload source content', d: 'Drop in long-form videos, raw footage, ad scripts or product B-rolls. We package it for clippers.' },
    { num: '03', t: 'Approve the brief', d: 'Set niche, do/don\'t rules, daily view caps. Approve or reject any clip within a 72-hour window.' },
    { num: '04', t: 'Pay only for views', d: 'Verified Reels and Shorts views via the official Instagram and YouTube APIs. No views, no charge.' },
  ]
  const clipperSteps = [
    { num: '01', t: 'Sign up with phone', d: 'Phone OTP only — no email, no password, no follower minimum. Add your UPI ID once.' },
    { num: '02', t: 'Pick a campaign', d: 'Browse open briefs by niche and earning tier. Download the source pack with one tap.' },
    { num: '03', t: 'Edit and post', d: 'Cut a 15–60s Reel or Short on any editor. Post it on your own Instagram or YouTube account.' },
    { num: '04', t: 'Get paid via UPI', d: 'Every verified view becomes earnings. Payouts hit your UPI within 7 days. Minimum ₹500.' },
  ]
  const steps = tab === 'brand' ? brandSteps : clipperSteps
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> How it works</span>
          <h2 className="display-2" style={{ color: 'white' }}>Four steps. No surprises.</h2>
        </div>
        <div className="tabs" role="tablist">
          <button className={`tab ${tab === 'brand' ? 'active' : ''}`} onClick={() => setTab('brand')}>For Brands</button>
          <button className={`tab ${tab === 'clipper' ? 'active' : ''}`} onClick={() => setTab('clipper')}>For Clippers</button>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-illus">
                <StepArt kind={tab} idx={i} />
              </div>
              <div className="step-num">{s.num}</div>
              <div className="step-title" style={{ color: 'white' }}>{s.t}</div>
              <p className="step-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyWondeed() {
  const cards = [
    { icon: 'rupee', t: 'Pay only for views', d: 'No retainer, no flat fee, no "we tried our best". You pay per verified view via the platform APIs — never for a post that flopped.' },
    { icon: 'users', t: 'Distributed reach', d: 'One brief becomes 30, 50, 200 different cuts on real creator handles. Your message lands across niches you couldn\'t buy your way into.' },
    { icon: 'shield-check', t: 'Verified, not estimated', d: 'Direct pulls from Instagram Graph and YouTube Data APIs. Anomaly detection on engagement. Holding period before payout.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Why Wondeed</span>
          <h2 className="display-2">A model that lines up everyone&apos;s incentives.</h2>
        </div>
        <div className="why-grid">
          {cards.map((c, i) => (
            <div key={i} className="why-card">
              <div className="why-icon"><Icon name={c.icon} width={22} height={22} /></div>
              <div>
                <h3 className="display-4">{c.t}</h3>
                <p style={{ marginTop: 12, color: 'var(--fg-mute)', fontSize: 15, lineHeight: 1.55 }}>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  const stats = [
    { num: '₹2.4', unit: 'Cr', lbl: 'Paid to clippers' },
    { num: '1,200', unit: '+', lbl: 'Campaigns run' },
    { num: '18', unit: 'Cr+', lbl: 'Views generated' },
    { num: '8,400', unit: '+', lbl: 'Clippers registered' },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="stat-row">
          {stats.map((s, i) => (
            <div className="stat-cell" key={i}>
              <div className="stat-num">{s.num}<span className="unit">{s.unit}</span></div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        <div className="tm-grid" style={{ marginTop: 56 }}>
          <div className="tm-card" style={{ background: 'var(--ink-2)', borderColor: 'var(--hairline-dark-2)', color: 'var(--on-dark)' }}>
            <p className="tm-quote" style={{ color: 'white' }}>
              &ldquo;We ran a ₹2L launch and got 47 clips across 31 different handles in 9 days. Our previous influencer agency got us 3 posts for the same budget.&rdquo;
            </p>
            <div className="tm-meta">
              <span className="tm-mark">L</span>
              <div>
                <div className="tm-name" style={{ color: 'white' }}>Lakshya R.</div>
                <div className="tm-role" style={{ color: 'var(--on-dark-mute)' }}>Growth Lead · D2C Beauty Brand</div>
              </div>
            </div>
          </div>
          <div className="tm-card">
            <p className="tm-quote">
              &ldquo;I&apos;m 21, in college, started with 280 followers. In four months I&apos;ve made over ₹40,000 just clipping during evening study breaks. UPI hits same week.&rdquo;
            </p>
            <div className="tm-meta">
              <span className="tm-mark">A</span>
              <div>
                <div className="tm-name">Arjun M.</div>
                <div className="tm-role">Clipper · @arjun.cuts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeFAQTeaser() {
  const router = useRouter()
  const faqs = [
    { q: 'How is my campaign budget charged?', a: 'Funds sit in your Wondeed wallet (Razorpay escrow). We deduct only after a clip\'s views are verified through the Instagram or YouTube API and clear the 72-hour holding period.' },
    { q: 'What counts as a verified view?', a: 'A view counted by Instagram Graph API or YouTube Data API on a public Reel or Short, after our anomaly check. Watch-time floors apply on Shorts.' },
    { q: 'Do clippers need a minimum follower count?', a: 'No. Zero followers is fine. Distribution comes from clip volume across many handles, not from any one creator\'s reach.' },
    { q: 'How fast do clippers get paid?', a: 'Earnings are released after a 72-hour holding period. UPI payouts settle within 7 days of release. Minimum payout is ₹500.' },
    { q: 'What\'s the minimum campaign budget?', a: '₹20,000. There is no upper limit. 100% of every rupee in your campaign goes to clippers — Wondeed earns from brand subscriptions, not from your budget.' },
    { q: 'What if a clipper misrepresents my brand?', a: 'You have a 72-hour content approval window. Reject any clip and the view payout is reversed. Repeated violations remove the clipper from the network.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow"><span className="dot" /> Common questions</span>
            <h2 className="display-2">Everything brands and clippers ask first.</h2>
          </div>
          <div>
            <div className="faq-list">
              {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
            </div>
            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => router.push('/faq')}>
                See all FAQs <Icon name="arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const router = useRouter()
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow"><span className="dot" /> Live · 1,200+ campaigns to date</span>
              <h1 className="display-1" style={{ marginTop: 22 }}>
                Pay only for<br />
                <span style={{ color: 'var(--green-2)' }}>views</span>. Reach<br />
                millions of Indians.
              </h1>
              <p className="lead" style={{ marginTop: 28 }}>
                Wondeed is India&apos;s first performance-based clipping marketplace. Brands fund video campaigns. Clippers turn them into Reels and Shorts. You only pay when views are verified.
              </p>
              <div className="hero-actions" style={{ marginTop: 36 }}>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
                  Start a campaign <Icon name="arrow-right" />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => router.push('/clippers')}>
                  I want to clip &amp; earn
                </button>
              </div>
              <div className="live-ticker">
                <span className="live-pulse" />
                <span><b style={{ color: 'var(--fg)' }}>₹4,820</b> just paid out to <b style={{ color: 'var(--fg)' }}>@arjun.cuts</b> · 2 min ago</span>
              </div>
            </div>
            <HeroVisual />
          </div>
        </div>
      </section>

      <MarketplaceLoop />
      <LiveCampaignsTeaser />
      <HowItWorksTabs />
      <WhyWondeed />
      <SocialProof />
      <HomeFAQTeaser />
      <FinalSplitCTA />
    </>
  )
}
