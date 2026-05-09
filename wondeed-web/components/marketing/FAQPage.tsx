'use client'

import { useState, useMemo } from 'react'
import Icon from './Icon'
import { FinalSplitCTA } from './shared'

const FAQ_BRANDS = [
  { q: 'How is my campaign budget charged?', a: 'You fund a Wondeed wallet via UPI, NEFT, RTGS or card (Razorpay). Money sits in escrow against your account. We deduct only after a view passes verification and clears the 72-hour holding window. Unspent budget is yours — withdraw it anytime.' },
  { q: 'What happens if a clip gets zero views?', a: 'You pay nothing for that clip. Performance-based means exactly that. The clipper takes the swing; you keep the budget for clips that land.' },
  { q: 'Can I cancel a campaign mid-flight?', a: 'Yes. Pause or end any campaign from your dashboard. Active clips already posted continue to earn against your wallet for 7 more days, then stop. Remaining budget returns instantly.' },
  { q: 'How do I fund my wallet?', a: 'UPI (recommended for speed), NEFT, RTGS, or card via Razorpay. UPI top-ups reflect within 60 seconds. NEFT/RTGS within banking hours. No top-up fees.' },
  { q: 'Which niches get the most clipper traction?', a: 'Lifestyle, fintech, edtech, gaming and D2C beauty have the deepest clipper supply. Niche tightness depends on the brief, source content quality and earning tier — we\'ll preview expected coverage before you launch.' },
  { q: 'Can I see who\'s clipping for me?', a: 'Yes. The campaign dashboard shows every clipper, their handles, their submitted clips and per-clip performance. Anonymity is opt-in for clippers — most go public once they trust the brand.' },
  { q: 'What if a clipper misrepresents my brand?', a: 'Reject the clip inside the 72-hour window. The payout reverses, the views don\'t deduct, and our trust team reviews the clipper for repeat behaviour. You can also block specific clippers from your future campaigns.' },
  { q: 'Do you handle GST invoices?', a: 'Yes. Subscription invoices include GSTIN, HSN code and a clean breakdown — eligible for input tax credit. Invoices auto-generate on the 1st of every month.' },
  { q: 'What\'s the minimum budget to start?', a: '₹20,000 per campaign. There is no minimum on subscription tier — Pro is free.' },
  { q: 'Can I run multiple campaigns at once?', a: 'Pro: 1 active campaign. Premium: 5 active. Enterprise: unlimited. All tiers can queue drafts; only active campaigns count toward the limit.' },
]

const FAQ_CLIPPERS = [
  { q: 'How and when do I get paid?', a: 'Views are tracked from your post URL. After the 72-hour holding period, verified earnings move from "Pending" to "Available". Once you cross ₹500 you can withdraw to UPI — most clippers see funds within 7 days, Tier 3 within 3 days.' },
  { q: 'What counts as a verified view?', a: 'A view that comes through Instagram\'s or YouTube\'s official APIs, with watch-time and engagement patterns consistent with organic reach. Bot views, view-exchange traffic and looping bursts don\'t count.' },
  { q: 'Do I need a minimum follower count?', a: 'No. Zero followers are welcome. We pay on views, not on audience size. Plenty of Tier 2 clippers earn well from accounts under 1,000 followers.' },
  { q: 'Can I submit clips to multiple campaigns?', a: 'Yes — as many as you want. Each clip must be unique to one campaign though. Don\'t cross-post the same edit to a different brand.' },
  { q: 'What if my clip gets removed by Instagram or YouTube?', a: 'Earnings up to the moment of removal are kept. Future views obviously stop. If the removal was platform-side and not your fault, we don\'t penalise your tier standing.' },
  { q: 'How long until I see my earnings?', a: 'Views appear in your dashboard within 6 hours of being pulled. Earnings move from Pending → Available 72 hours after each snapshot. From there it\'s a UPI withdrawal whenever you cross ₹500.' },
  { q: 'Is there a payout threshold?', a: 'Yes — ₹500 minimum withdrawal. This keeps UPI fees and reconciliation sane. Earnings under ₹500 keep accruing across campaigns; nothing expires.' },
  { q: 'Can I clip on multiple accounts?', a: 'You can link multiple Instagram and YouTube handles to one Wondeed profile. We don\'t allow multiple Wondeed accounts per person — that\'s a permanent ban.' },
  { q: 'What happens if a campaign ends while my clip is still earning?', a: 'Your clip continues to earn for 7 days after the campaign closes, against any remaining budget. After that, views stop converting — but your post stays up; that\'s yours.' },
  { q: 'How do I move up clipper tiers?', a: 'Tier 1 → Tier 2: complete 5 approved clips with no rejections. Tier 2 → Tier 3: 50 verified clips and a 95%+ approval rate over the last 90 days. Tiers unlock higher-earning campaigns and faster payouts.' },
]

function FAQList({ items, query }: { items: typeof FAQ_BRANDS; query: string }) {
  const [openIdx, setOpenIdx] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(it => (it.q + ' ' + it.a).toLowerCase().includes(q))
  }, [items, query])

  return (
    <section className="section white" style={{ paddingTop: 64 }}>
      <div className="container" style={{ maxWidth: 820 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div className="display-4">No questions match &ldquo;{query}&rdquo;.</div>
            <p style={{ color: 'var(--fg-mute)', marginTop: 8 }}>
              Try fewer words, or write to us at <span style={{ color: 'var(--ink)', fontWeight: 600 }}>hello@wondeed.com</span>.
            </p>
          </div>
        ) : (
          <div className="faq-list">
            {filtered.map((it, i) => (
              <div className={`faq-item ${openIdx === i ? 'open' : ''}`} key={i}>
                <button className="faq-q" onClick={() => setOpenIdx(openIdx === i ? -1 : i)} aria-expanded={openIdx === i}>
                  <span>{it.q}</span>
                  <span className="faq-toggle"><Icon name={openIdx === i ? 'minus' : 'plus'} /></span>
                </button>
                <div className="faq-a">{it.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function FAQPage() {
  const [tab, setTab] = useState<'brands' | 'clippers'>('brands')
  const [query, setQuery] = useState('')
  const items = tab === 'brands' ? FAQ_BRANDS : FAQ_CLIPPERS

  return (
    <>
      <section className="hero dark" style={{ paddingBottom: 56 }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
            <span className="eyebrow"><span className="dot" /> FAQ</span>
            <h1 className="display-1" style={{ marginTop: 22, color: 'white' }}>
              Answers, before you ask.
            </h1>
            <p className="lead" style={{ marginTop: 20, marginInline: 'auto' }}>
              Most questions about Wondeed land on this page. If yours doesn&apos;t, write to us — we read everything.
            </p>
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
              <div className="faq-tabs" role="tablist">
                <button
                  className={`faq-tab${tab === 'brands' ? ' active' : ''}`}
                  onClick={() => setTab('brands')}
                  role="tab"
                  aria-selected={tab === 'brands'}
                >
                  For Brands
                </button>
                <button
                  className={`faq-tab${tab === 'clippers' ? ' active' : ''}`}
                  onClick={() => setTab('clippers')}
                  role="tab"
                  aria-selected={tab === 'clippers'}
                >
                  For Clippers
                </button>
              </div>
            </div>
            <div style={{ marginTop: 18, position: 'relative', maxWidth: 520, marginInline: 'auto' }}>
              <Icon name="search" width={18} height={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-dark-2)' }} />
              <input
                type="text"
                placeholder="Search questions…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--hairline-dark-2)',
                  color: 'white',
                  borderRadius: 999,
                  padding: '14px 18px 14px 48px',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>
      <FAQList items={items} query={query} />
      <FinalSplitCTA />
    </>
  )
}
