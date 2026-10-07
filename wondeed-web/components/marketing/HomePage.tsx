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
            <stop offset="0" stopColor="#2A2044" />
            <stop offset="1" stopColor="#1C1530" />
          </linearGradient>
          <linearGradient id="hg-grad-2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFDF8" />
            <stop offset="1" stopColor="#F3ECDC" />
          </linearGradient>
          <linearGradient id="hg-grad-3" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#F04E23" />
            <stop offset="1" stopColor="#FFB800" />
          </linearGradient>
          <pattern id="hg-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="rgba(28,21,48,0.08)" />
          </pattern>
        </defs>
        <circle cx="290" cy="280" r="250" fill="rgba(240,78,35,0.07)" />
        <circle cx="290" cy="280" r="185" fill="rgba(109,74,255,0.06)" />
        {/* Campaign card */}
        <g transform="translate(36, 70)"><g className="float-a" style={({ '--rot': '-4deg' } as React.CSSProperties)}>
          <rect width="330" height="226" rx="20" fill="#FFFDF8" stroke="#1C1530" strokeWidth="2.5" />
          <rect x="20" y="20" width="290" height="118" rx="12" fill="url(#hg-grad-2)" stroke="#1C1530" strokeWidth="1.5" />
          <rect x="20" y="20" width="290" height="118" rx="12" fill="url(#hg-dots)" />
          <rect x="32" y="32" width="96" height="24" rx="12" fill="#1C1530" />
          <circle cx="44" cy="44" r="3.5" fill="#FFB800" />
          <text x="54" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#FFF9F0" letterSpacing="0.8">LIVE · D2C</text>
          <text x="20" y="168" fontFamily="Fraunces, serif" fontSize="21" fontWeight="600" fill="#1C1530">Glow Beauty Launch</text>
          <rect x="20" y="182" width="290" height="8" rx="4" fill="#F3ECDC" />
          <rect x="20" y="182" width="190" height="8" rx="4" fill="url(#hg-grad-3)" />
          <text x="20" y="210" fontFamily="Inter, sans-serif" fontSize="11.5" fill="#6E6484" fontWeight="500">₹1.2L of ₹2L · 38 clippers · 6d left</text>
        </g></g>
        {/* Phone */}
        <g transform="translate(292, 120)"><g className="float-b" style={({ '--rot': '5deg' } as React.CSSProperties)}>
          <rect width="196" height="360" rx="36" fill="#1C1530" stroke="#1C1530" strokeWidth="2" />
          <rect x="10" y="10" width="176" height="340" rx="28" fill="url(#hg-grad-1)" />
          <rect x="80" y="18" width="36" height="7" rx="3.5" fill="#0F0A1E" />
          <circle cx="98" cy="168" r="34" fill="#FFFDF8" stroke="#1C1530" strokeWidth="2.5" />
          <path d="M91 154 v28 l23 -14 z" fill="#F04E23" />
          <rect x="22" y="286" width="152" height="52" rx="12" fill="rgba(0,0,0,0.45)" stroke="rgba(255,249,240,0.2)" />
          <text x="34" y="308" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#FFB800" letterSpacing="0.8" fontWeight="700">VERIFIED VIEWS</text>
          <text x="34" y="328" fontFamily="Fraunces, serif" fontSize="20" fontWeight="600" fill="#FFF9F0">1,24,560</text>
        </g></g>
        {/* Payout ticket */}
        <g transform="translate(70, 392)"><g className="float-a" style={({ '--rot': '-2deg' } as React.CSSProperties)}>
          <rect width="210" height="80" rx="16" fill="#FFFDF8" stroke="#1C1530" strokeWidth="2.5" />
          <line x1="150" y1="10" x2="150" y2="70" stroke="#1C1530" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" />
          <rect x="14" y="20" width="38" height="38" rx="11" fill="#F04E23" stroke="#1C1530" strokeWidth="1.5" />
          <text x="26" y="45" fontFamily="Fraunces, serif" fontSize="20" fontWeight="700" fill="#FFFDF8">₹</text>
          <text x="62" y="36" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#6E6484" letterSpacing="0.8" fontWeight="700">UPI PAYOUT</text>
          <text x="62" y="60" fontFamily="Fraunces, serif" fontSize="22" fontWeight="600" fill="#1C1530">₹4,820</text>
          <text x="162" y="60" fontFamily="Inter, sans-serif" fontSize="11" fill="#1E9E6A" fontWeight="700">+18%</text>
        </g></g>
        {/* Sticker */}
        <g transform="translate(430, 60) rotate(8)">
          <rect width="104" height="36" rx="18" fill="#FFB800" stroke="#1C1530" strokeWidth="2" />
          <text x="52" y="23" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#1C1530" letterSpacing="1">100% REAL</text>
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
          <h2 className="display-2">Two sides. <em>One loop.</em></h2>
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
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1.5px dashed var(--hairline-strong)' : 'none', fontSize: 14 }}>
                  <span style={{ color: 'var(--fg-mute)' }}>{row.l}</span>
                  <span style={{ fontWeight: 700 }}>{row.r}</span>
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
                { l: 'Clip posted', r: '@creator.cuts' },
                { l: 'Verified views', r: '1,24,560' },
                { l: 'Earned this month', r: '₹4,820' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1.5px dashed rgba(255,249,240,0.2)' : 'none', fontSize: 14 }}>
                  <span style={{ color: 'var(--on-dark-2)' }}>{row.l}</span>
                  <span style={{ fontWeight: 700, color: i === 2 ? 'var(--gold)' : 'white' }}>{row.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function NicheShowcase() {
  const router = useRouter()
  const niches = [
    { name: 'Fintech & Stock',    desc: 'UPI apps, neo-banking, investment, credit cards' },
    { name: 'D2C Beauty',         desc: 'Skincare, haircare, cosmetics, wellness products' },
    { name: 'EdTech',             desc: 'JEE, NEET, UPSC, coding bootcamps, skill courses' },
    { name: 'Gaming & Esports',   desc: 'Mobile titles, fantasy sports, PC, casual gaming' },
    { name: 'Quick Commerce',     desc: 'Grocery delivery, food apps, hyper-local brands' },
    { name: 'Lifestyle & Apparel',desc: 'Fashion, homewear, travel, health & fitness' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 48 }}>
          <div>
            <span className="eyebrow"><span className="dot" /> Open for campaigns</span>
            <h2 className="display-2" style={{ marginTop: 14 }}>One brief.<br />30+ angles. <em>Every niche.</em></h2>
          </div>
          <button className="btn btn-ghost" onClick={() => router.push('/signup')}>
            Start a campaign <Icon name="arrow-right" />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {niches.map((n, i) => (
            <div key={i} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em' }}>{n.name}</div>
              <p style={{ color: 'var(--fg-mute)', fontSize: 14, margin: 0, lineHeight: 1.55 }}>{n.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 22, fontSize: 13, color: 'var(--fg-faint)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>ALL NICHES ACCEPTED · BRIEF TO LIVE IN 48 HOURS · CLIPPER DEPTH GROWS WITH CPM TIER</p>
      </div>
    </section>
  )
}

function StepArt({ kind, idx }: { kind: string; idx: number }) {
  const ink = '#1C1530'
  const accent = '#F04E23'
  const gold = '#FFB800'
  const paper = '#FFFDF8'
  const soft = '#FFE4D3'
  if (kind === 'brand') {
    if (idx === 0) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <rect x="30" y="40" width="140" height="80" rx="14" fill={paper} stroke={ink} strokeWidth="2.5" />
        <rect x="44" y="56" width="60" height="10" rx="5" fill={soft} />
        <rect x="44" y="74" width="100" height="24" rx="7" fill={accent} stroke={ink} strokeWidth="1.5" />
        <text x="94" y="90" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="12" fontWeight="700" fill="#FFFDF8">₹2,00,000</text>
        <circle cx="160" cy="58" r="14" fill={gold} stroke={ink} strokeWidth="2" />
      </svg>
    )
    if (idx === 1) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <rect x="40" y="38" width="56" height="84" rx="10" fill={paper} stroke={ink} strokeWidth="2.5" />
        <rect x="50" y="50" width="36" height="48" rx="4" fill={soft} />
        <path d="M62 68 v16 l14 -8 z" fill={accent} />
        <rect x="104" y="38" width="56" height="84" rx="10" fill={paper} stroke={ink} strokeWidth="2.5" />
        <rect x="114" y="50" width="36" height="48" rx="4" fill="#F3ECDC" />
        <line x1="120" y1="74" x2="142" y2="74" stroke={ink} strokeWidth="2" opacity="0.4" />
      </svg>
    )
    if (idx === 2) return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(${30 + i * 50}, 40)`}>
            <rect width="40" height="80" rx="8" fill={paper} stroke={ink} strokeWidth="2.5" />
            {i === 0 && <circle cx="20" cy="68" r="10" fill={accent} stroke={ink} strokeWidth="1.5" />}
            {i === 0 && <path d="M16 68 l3 4 6 -8" stroke="#FFFDF8" strokeWidth="2" fill="none" strokeLinecap="round" />}
            {i !== 0 && <rect x="10" y="58" width="20" height="20" rx="10" fill="#F3ECDC" stroke={ink} strokeWidth="1.5" />}
          </g>
        ))}
      </svg>
    )
    return (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <polyline points="20,120 50,90 80,100 110,60 140,72 180,30" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="180" cy="30" r="7" fill={gold} stroke={ink} strokeWidth="2" />
        <text x="20" y="142" fontFamily="JetBrains Mono" fontSize="9" fill={ink} opacity="0.55" letterSpacing="0.5">VERIFIED VIEWS · 30D</text>
      </svg>
    )
  }
  if (idx === 0) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="62" y="24" width="76" height="120" rx="16" fill={paper} stroke={ink} strokeWidth="2.5" />
      <rect x="70" y="46" width="60" height="22" rx="7" fill="#F3ECDC" stroke={ink} strokeWidth="1.5" />
      <text x="100" y="60" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={ink} opacity="0.6">+91 ___ ___ ___</text>
      <rect x="70" y="76" width="60" height="24" rx="7" fill={accent} stroke={ink} strokeWidth="1.5" />
      <text x="100" y="91" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#FFFDF8">SEND OTP</text>
    </svg>
  )
  if (idx === 1) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      {[0, 1].map(i => (
        <g key={i} transform={`translate(${30 + i * 70}, 30)`}>
          <rect width="68" height="100" rx="10" fill={paper} stroke={ink} strokeWidth="2.5" />
          <rect x="10" y="10" width="48" height="50" rx="5" fill={soft} stroke={ink} strokeWidth="1.5" />
          <path d="M30 30 v12 l10 -6 z" fill={accent} />
          <rect x="10" y="68" width="40" height="6" rx="3" fill={ink} opacity="0.25" />
          <rect x="10" y="80" width="28" height="5" rx="2.5" fill={ink} opacity="0.15" />
        </g>
      ))}
    </svg>
  )
  if (idx === 2) return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="36" y="24" width="128" height="112" rx="12" fill={paper} stroke={ink} strokeWidth="2.5" />
      <rect x="46" y="34" width="108" height="64" rx="7" fill={soft} stroke={ink} strokeWidth="1.5" />
      <path d="M86 56 v20 l24 -10 z" fill={accent} />
      <line x1="46" y1="110" x2="154" y2="110" stroke={ink} opacity="0.2" />
      <line x1="80" y1="110" x2="80" y2="100" stroke={accent} strokeWidth="3.5" />
    </svg>
  )
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%">
      <rect x="40" y="40" width="120" height="80" rx="14" fill={paper} stroke={ink} strokeWidth="2.5" />
      <rect x="54" y="56" width="42" height="14" rx="4" fill={ink} opacity="0.25" />
      <text x="54" y="96" fontFamily="Fraunces, serif" fontSize="24" fontWeight="600" fill={accent}>₹4,820</text>
      <circle cx="138" cy="60" r="14" fill={gold} stroke={ink} strokeWidth="2" />
      <path d="M134 60 l3 3 6 -7" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
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
          <h2 className="display-2" style={{ color: 'white' }}>Four steps. <em>No surprises.</em></h2>
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
          <h2 className="display-2">A model that lines up <em>everyone&apos;s</em> incentives.</h2>
        </div>
        <div className="why-grid">
          {cards.map((c, i) => (
            <div key={i} className="why-card">
              <div className="why-icon"><Icon name={c.icon} width={22} height={22} /></div>
              <div>
                <h3 className="display-4">{c.t}</h3>
                <p style={{ marginTop: 12, color: 'var(--fg-mute)', fontSize: 15, lineHeight: 1.6 }}>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandPromises() {
  const promises = [
    {
      num: '₹0',
      title: 'If a clip gets zero views',
      body: 'You pay nothing for a clip that doesn\'t land. The clipper took the swing. Your budget stays intact.',
    },
    {
      num: '100%',
      title: 'Of your budget goes to clippers',
      body: 'Wondeed earns from your subscription, never from your campaign spend. Every rupee you deposit reaches a clipper.',
    },
    {
      num: '72h',
      title: 'To reject any clip — no questions',
      body: 'Off-brand? Wrong tone? Reject inside the window and the view payout reverses automatically.',
    },
    {
      num: '7d',
      title: 'UPI payout after views clear',
      body: 'Verified views → 72-hour hold → UPI settled. Tier 3 clippers get 3-day fast-track. No delays, no exceptions.',
    },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Four guarantees</span>
          <h2 className="display-2" style={{ color: 'white' }}>The numbers that <em>actually matter.</em></h2>
          <p className="lead">No follower estimates. No deck metrics. Four product facts that define every campaign on Wondeed.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {promises.map((p, i) => (
            <div key={i} style={{ background: 'rgba(255,249,240,0.05)', border: '1.5px solid var(--hairline-dark-2)', borderRadius: 22, padding: 34, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 'clamp(46px, 5.5vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--gold)' }}>{p.num}</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em', color: 'white', lineHeight: 1.3 }}>{p.title}</div>
              <p style={{ color: 'var(--on-dark-2)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomeFAQTeaser() {
  const router = useRouter()
  const faqs = [
    { q: 'How is my campaign budget charged?', a: 'Funds sit in your Wondeed escrow wallet. We deduct only after a clip\'s views are verified through the Instagram or YouTube API and clear the 72-hour holding period.' },
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
            <h2 className="display-2">Everything brands and clippers <em>ask first.</em></h2>
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

/** everything below the hero — reused by the story landing */
export function HomeSections() {
  return (
    <>
      <MarketplaceLoop />
      <NicheShowcase />
      <HowItWorksTabs />
      <WhyWondeed />
      <BrandPromises />
      <HomeFAQTeaser />
      <FinalSplitCTA />
    </>
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
              <span className="sticker">Performance clipping marketplace</span>
              <h1 className="display-1" style={{ marginTop: 26 }}>
                Pay only for<br />
                <em>views</em>. Reach<br />
                millions of <span className="hl">Indians.</span>
              </h1>
              <p className="lead" style={{ marginTop: 28 }}>
                Wondeed is India&apos;s first performance-based clipping marketplace. Brands fund video campaigns. Clippers turn them into Reels and Shorts. You only pay when views are verified.
              </p>
              <div className="hero-actions" style={{ marginTop: 36 }}>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Start a campaign <Icon name="arrow-right" />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => router.push('/clippers')}>
                  I want to clip &amp; earn
                </button>
              </div>
              <div className="live-ticker">
                <span className="live-pulse" />
                Campaigns open now · 100% of budgets reach clippers · UPI payouts in 7 days
              </div>
            </div>
            <HeroVisual />
          </div>
        </div>
      </section>

      <HomeSections />
    </>
  )
}
