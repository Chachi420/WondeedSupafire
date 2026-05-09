'use client'

import { useState, useMemo } from 'react'
import Icon from './Icon'
import { FAQItem } from './shared'

const CATEGORIES = [
  {
    id: 'getting-started',
    icon: 'sparkles',
    title: 'Getting Started',
    items: [
      { q: 'How do I create an account?', a: 'Open Wondeed and click "Sign up with phone". Enter your Indian mobile number, verify via OTP, select your role (Brand or Clipper), and you\'re in. No email or password required.' },
      { q: 'What is Wondeed?', a: 'Wondeed is a performance-based short-form video marketplace. Brands set a per-view rate and deposit a budget. Clippers make Reels and Shorts and post them on their own accounts. Earnings are calculated based on real views — verified via the Instagram Graph API or YouTube Data API.' },
      { q: 'Is Wondeed available only in India?', a: 'Yes. Wondeed is built for the Indian market. Payouts are in INR via UPI. Brands must have a registered Indian business entity.' },
      { q: 'What age do I need to be?', a: 'You must be at least 18 years old. For UPI payouts, you\'ll need a valid Indian bank account linked to UPI.' },
    ],
  },
  {
    id: 'payments',
    icon: 'wallet',
    title: 'Payments & Payouts',
    items: [
      { q: 'When and how do I get paid?', a: 'Views go through a 72-hour hold period. Once views are confirmed and your balance crosses ₹500, you can request a payout. It lands in your linked UPI ID within 7 days. Tier 3 clippers get 3-day fast-track payouts.' },
      { q: 'What is the minimum payout?', a: 'The minimum payout request is ₹500. Earnings below this threshold accumulate until you cross it.' },
      { q: 'How do brands pay?', a: 'Brands deposit a campaign budget via Razorpay (UPI, net banking, or credit card). 100% of the deposited amount goes into the campaign pool for clipper payouts.' },
      { q: 'Can I change my UPI ID?', a: 'Yes. Go to Account Settings and update your UPI ID at any time. Any pending payout will go to the UPI ID that was active when the payout was requested.' },
    ],
  },
  {
    id: 'campaigns',
    icon: 'flag',
    title: 'Campaigns',
    items: [
      { q: 'What is a campaign brief?', a: 'A brief is the creative direction a brand provides. It includes: the product or service to feature, the hook to deliver, dos and don\'ts, example clips, and the source media pack (logo, product shots, etc.).' },
      { q: 'How many campaigns can I work on at once?', a: 'Tier 1 clippers: up to 3 active campaigns. Tier 2: up to 8. Tier 3: unlimited. Each submission occupies one slot until approved or rejected.' },
      { q: 'What happens if my clip is rejected?', a: 'You\'ll see the rejection reason in your dashboard. Common reasons: off-brief, low quality, platform policy violation. A rejected clip frees your slot — you can resubmit if the campaign is still open.' },
      { q: 'Can I post the same clip to multiple campaigns?', a: 'No. Each clip must be made specifically for that campaign\'s brief. Repurposing a clip across campaigns will result in rejection.' },
    ],
  },
  {
    id: 'technical',
    icon: 'shield-check',
    title: 'Technical',
    items: [
      { q: 'How are views verified?', a: 'Views are fetched directly from the Instagram Graph API (Reels) or YouTube Data API (Shorts) using your connected account. We don\'t rely on screenshots or self-reported numbers. Only public posts from your connected account are counted.' },
      { q: 'My views aren\'t updating. What do I do?', a: 'API updates have a 6–12 hour lag in some cases. Wait 12 hours and check again. If views are still not updating, go to Account → Connections and reconnect your account.' },
      { q: 'What platforms are supported?', a: 'Currently: Instagram (Reels) and YouTube (Shorts). TikTok integration is planned but not available yet.' },
      { q: 'Is my account data safe?', a: 'Yes. We request only read access to your public media metrics. We never post on your behalf or access private data. See our Privacy Policy for full details.' },
    ],
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState('getting-started')

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return CATEGORIES.flatMap(c => c.items.filter(i => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)))
  }, [search])

  const active = CATEGORIES.find(c => c.id === activeId)!

  return (
    <>
      <section className="hero dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><span className="dot" /> Help Center</span>
          <h1 className="display-1" style={{ color: 'white', marginTop: 20, maxWidth: '22ch', margin: '20px auto 0' }}>How can we help?</h1>
          <div style={{ marginTop: 32, maxWidth: 480, margin: '32px auto 0', position: 'relative' }}>
            <input
              type="search"
              placeholder="Search help articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 18px 14px 48px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}>
              <Icon name="search" width={18} height={18} />
            </div>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          {filtered ? (
            <div>
              <p style={{ marginBottom: 24, color: 'var(--fg-mute)', fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
              </p>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-mute)' }}>
                  <p>No results. <a href="mailto:help@wondeed.com" style={{ color: 'var(--ink)', fontWeight: 600 }}>Email us</a> and we&apos;ll help directly.</p>
                </div>
              ) : (
                <div className="faq-list">
                  {filtered.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--display)', fontWeight: 600, fontSize: 14, background: activeId === c.id ? 'var(--ink)' : 'transparent', color: activeId === c.id ? 'white' : 'var(--ink)' }}
                  >
                    <Icon name={c.icon} width={16} height={16} /> {c.title}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h2 className="display-3" style={{ marginBottom: 20 }}>{active.title}</h2>
                <div className="faq-list">
                  {active.items.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 48, padding: '24px 28px', background: 'var(--paper)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>Still have questions?</div>
              <div style={{ color: 'var(--fg-mute)', fontSize: 14, marginTop: 4 }}>Our team responds within 24 hours on working days.</div>
            </div>
            <a href="mailto:help@wondeed.com" className="btn btn-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Email support <Icon name="arrow-right" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
