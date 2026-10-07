'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FAQItem, fmtINR, FinalSplitCTA } from './shared'
import { rpcCall } from '@/lib/supabase/rpc'

/* ---------- helpers ---------- */

type BoardRow = {
  rank: number
  clipper_id: string
  display_name: string | null
  total_earned: number
  total_views: number
  submissions: number
  movement: number | null
  tier: 'rookie' | 'pro' | 'legend'
}

function fmtViews(v: number): string {
  if (!v) return '0'
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)} Cr`
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)} L`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return String(Math.round(v))
}

function shortName(row: BoardRow): string {
  if (row.display_name && row.display_name.trim()) {
    const parts = row.display_name.trim().split(/\s+/)
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  }
  return `Clipper ${row.clipper_id.slice(0, 4).toUpperCase()}`
}

function Move({ m }: { m: number | null }) {
  if (m === null || m === undefined) return <span className="move-new">NEW</span>
  if (m > 0) return <span className="move move-up">▲{m}</span>
  if (m < 0) return <span className="move move-down">▼{-m}</span>
  return <span className="move move-same">•</span>
}

function TierChip({ tier }: { tier: string }) {
  const label = tier === 'legend' ? 'LEGEND' : tier === 'pro' ? 'PRO' : 'ROOKIE'
  return <span className={`tier-chip t-${tier}`}>{label}</span>
}

/* ---------- hero visual: floating league cards ---------- */

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 560 560" width="100%" height="100%">
        <defs>
          <linearGradient id="ah-grad-1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFDF8" />
            <stop offset="1" stopColor="#F3ECDC" />
          </linearGradient>
          <linearGradient id="ah-grad-2" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFB800" />
            <stop offset="1" stopColor="#FF8A00" />
          </linearGradient>
          <pattern id="ah-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="rgba(28,21,48,0.08)" />
          </pattern>
        </defs>
        <circle cx="290" cy="280" r="250" fill="rgba(240,78,35,0.07)" />
        <circle cx="290" cy="280" r="185" fill="rgba(255,184,0,0.08)" />
        {/* League table card */}
        <g transform="translate(36, 60)"><g className="float-a" style={{ '--rot': '-4deg' } as React.CSSProperties}>
          <rect width="330" height="262" rx="20" fill="#FFFDF8" stroke="#1C1530" strokeWidth="2.5" />
          <rect width="330" height="52" rx="20" fill="#1C1530" />
          <rect y="32" width="330" height="20" fill="#1C1530" />
          <circle cx="30" cy="26" r="4" fill="#FFB800" />
          <text x="44" y="30" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#FFF9F0" letterSpacing="1.5">LEAGUE · WEEK 41</text>
          <text x="292" y="30" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#FFB800" letterSpacing="1">LIVE</text>
          {[
            { r: '1', n: 'Aarav M.', e: '₹12,400', bg: '#FFB800', mv: '▲2' },
            { r: '2', n: 'Sneha K.', e: '₹9,850', bg: '#C9CDD6', mv: '▼1' },
            { r: '3', n: 'Rohan D.', e: '₹8,120', bg: '#D08A4E', mv: '▲5' },
          ].map((p, i) => (
            <g key={i} transform={`translate(0, ${64 + i * 62})`}>
              <rect x="16" y="0" width="298" height="52" rx="12" fill={i === 0 ? 'rgba(255,184,0,0.14)' : 'url(#ah-grad-1)'} stroke="#1C1530" strokeWidth="1.5" />
              <rect x="28" y="10" width="32" height="32" rx="9" fill={p.bg} stroke="#1C1530" strokeWidth="1.5" />
              <text x="44" y="32" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="16" fontWeight="700" fill="#1C1530">{p.r}</text>
              <text x="72" y="32" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="700" fill="#1C1530">{p.n}</text>
              <text x="236" y="32" fontFamily="JetBrains Mono, monospace" fontSize="12.5" fontWeight="700" fill="#1C1530">{p.e}</text>
              <text x="292" y="32" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill={p.mv[0] === '▲' ? '#1E9E6A' : '#D64545'}>{p.mv}</text>
            </g>
          ))}
        </g></g>
        {/* Golden Boot ticket */}
        <g transform="translate(300, 330)"><g className="float-b" style={{ transform: 'rotate(5deg)' }}>
          <rect width="220" height="150" rx="18" fill="#1C1530" stroke="#1C1530" strokeWidth="2" />
          <rect x="14" y="14" width="192" height="122" rx="12" fill="url(#ah-grad-2)" />
          <text x="32" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#1C1530" letterSpacing="1.6">GOLDEN BOOT</text>
          <text x="30" y="88" fontFamily="Fraunces, serif" fontSize="30" fontWeight="700" fill="#1C1530">₹25,000</text>
          <text x="32" y="112" fontFamily="Inter, sans-serif" fontSize="11.5" fontWeight="600" fill="#1C1530" opacity="0.75">season bonus · most views</text>
          <text x="180" y="80" fontFamily="Fraunces, serif" fontSize="44" fill="#1C1530" opacity="0.85">◈</text>
        </g></g>
        {/* Sticker */}
        <g transform="translate(66, 380) rotate(-6)">
          <rect width="132" height="38" rx="19" fill="#F04E23" stroke="#1C1530" strokeWidth="2" />
          <text x="66" y="24" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11.5" fontWeight="700" fill="#FFFDF8" letterSpacing="1.2">SEASON 1</text>
        </g>
      </svg>
    </div>
  )
}

/* ---------- ticker ---------- */

function SeasonTicker() {
  const items = [
    'SEASON 1 REGISTRATIONS OPEN', 'WEEKLY DROPS EVERY MONDAY', '100% OF BUDGETS REACH CLIPPERS',
    'UPI PAYOUTS · MIN ₹500', 'GOLDEN BOOT · ₹25,000 SEASON BONUS', 'ROOKIE → PRO → LEGEND',
  ]
  const row = [...items, ...items]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row.map((t, i) => (
          <span key={i}>{t} <span className="t-sep">◆</span></span>
        ))}
      </div>
    </div>
  )
}

/* ---------- league preview ---------- */

function LeaguePreview() {
  const router = useRouter()
  const [rows, setRows] = useState<BoardRow[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    rpcCall<BoardRow[]>('get_leaderboard', { p_period: 'weekly' }).then(({ data, error }) => {
      if (!error && Array.isArray(data)) setRows(data.slice(0, 5))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> The standings</span>
          <h2 className="display-2">This week&apos;s <em>league table.</em></h2>
          <p className="lead">Ranked by verified-view earnings. Resets every Monday, 00:00 IST. Legends are made weekly.</p>
        </div>
        {!loaded ? (
          <div className="league-table"><div className="empty-pitch" style={{ border: 'none' }}><p>Loading the table…</p></div></div>
        ) : rows.length === 0 ? (
          <div className="empty-pitch">
            <div className="ep-whistle">◷</div>
            <h3>Pre-season</h3>
            <p>Season 1 hasn&apos;t kicked off yet — the table is empty and the Golden Boot is up for grabs. Early clippers earn a permanent Founder badge.</p>
            <button className="btn btn-primary" onClick={() => router.push('/signup')}>Claim your spot <Icon name="arrow-right" /></button>
          </div>
        ) : (
          <>
            <div className="league-table">
              <div className="lrow head"><span>RANK</span><span>CLIPPER</span><span className="lviews" style={{ textAlign: 'right' }}>VIEWS</span><span className="learned" style={{ textAlign: 'right' }}>EARNED</span><span style={{ textAlign: 'right' }}>MOVE</span></div>
              {rows.map((r) => (
                <div key={r.clipper_id} className={`lrow ${r.rank === 1 ? 'top1' : r.rank <= 3 ? 'top3' : ''}`}>
                  <span><span className="rank-badge">{r.rank}</span></span>
                  <span className="lplayer">
                    <div className="lname">{shortName(r)}</div>
                    <div className="lsub"><TierChip tier={r.tier} /></div>
                  </span>
                  <span className="lnum dim lviews">{fmtViews(r.total_views)}</span>
                  <span className="lnum learned">{fmtINR(r.total_earned)}</span>
                  <span style={{ textAlign: 'right' }}><Move m={r.movement} /></span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => router.push('/leaderboard')}>
                Full standings <Icon name="arrow-right" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ---------- golden boot ---------- */

function GoldenBoot() {
  const router = useRouter()
  return (
    <section className="section white">
      <div className="container">
        <div className="golden-boot">
          <div className="boot-trophy" aria-hidden="true">◈</div>
          <div>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}><span className="dot" style={{ background: 'var(--gold)' }} /> The prize</span>
            <h3>The <em>Golden Boot.</em></h3>
            <p>Most verified views in a season takes the Boot — plus a <strong style={{ color: 'var(--gold)' }}>₹25,000 bonus</strong> on top of per-view earnings. No judges, no favourites. The numbers decide.</p>
            <div className="boot-stats">
              <div className="boot-stat"><div className="bs-num">₹25K</div><div className="bs-lab">SEASON BONUS</div></div>
              <div className="boot-stat"><div className="bs-num">12 wks</div><div className="bs-lab">PER SEASON</div></div>
              <div className="boot-stat"><div className="bs-num">Top 3</div><div className="bs-lab">PAID OUT</div></div>
            </div>
            <div style={{ marginTop: 22 }}>
              <button className="btn btn-primary" onClick={() => router.push('/clippers')}>Chase the Boot <Icon name="arrow-right" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- matchday ---------- */

function useCountdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const istNow = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000)
      const next = new Date(istNow)
      next.setDate(next.getDate() + ((8 - next.getDay()) % 7 || 7))
      next.setHours(0, 0, 0, 0)
      const diff = Math.max(0, next.getTime() - istNow.getTime())
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return left
}

function Matchday() {
  const router = useRouter()
  const { d, h, m, s } = useCountdown()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <section className="section paper">
      <div className="container">
        <div className="matchday">
          <div>
            <h3>Matchday drops every Monday.</h3>
            <p>Fresh brand campaigns land at 00:00 IST. Claim your match, cut your clip, post it — the fastest clippers get first pick of the highest-paying briefs.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-lg" style={{ background: 'var(--ink)', color: 'var(--paper)' }} onClick={() => router.push('/signup')}>
                Get drop alerts <Icon name="arrow-right" />
              </button>
              <button className="btn btn-ghost btn-lg" style={{ borderColor: 'rgba(255,253,248,0.5)', color: '#FFFDF8' }} onClick={() => router.push('/brands')}>
                Drop a campaign
              </button>
            </div>
          </div>
          <div className="countdown" aria-label="Countdown to next drop">
            {[{ n: pad(d), l: 'DAYS' }, { n: pad(h), l: 'HRS' }, { n: pad(m), l: 'MIN' }, { n: pad(s), l: 'SEC' }].map((c) => (
              <div className="cd-cell" key={c.l}><div className="cd-num">{c.n}</div><div className="cd-lab">{c.l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- season rules ---------- */

function SeasonRules() {
  const rules = [
    { kicker: 'RULE 01', title: 'Pick your match', body: 'Browse the weekly drop. Claim a campaign brief that fits your style — beauty, fintech, D2C, gaming. First come, first served.' },
    { kicker: 'RULE 02', title: 'Post your clip', body: 'Cut it your way and post on your own Instagram or YouTube. No follower minimum — volume across handles beats any single account.' },
    { kicker: 'RULE 03', title: 'Get paid per view', body: 'Views are verified through platform APIs. Earnings land in your wallet, then UPI — minimum ₹500. The table updates weekly.' },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Season rules</span>
          <h2 className="display-2">Three rules. <em>Zero fine print.</em></h2>
        </div>
        <div className="season-rules">
          {rules.map((r, i) => (
            <div className="rule-card" key={i}>
              <div className="rule-num">{i + 1}</div>
              <div className="rule-kicker">{r.kicker}</div>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- kept trust sections ---------- */

function BrandPromises() {
  const promises = [
    {
      num: '100%',
      title: 'Of campaign budgets reach clippers',
      body: 'Wondeed earns from brand subscriptions — never from your budget. Every rupee you put in is payable to creators.',
    },
    {
      num: '72h',
      title: 'To reject any clip — no questions',
      body: 'Off-brand? Wrong tone? Reject inside the window and the view payout reverses automatically.',
    },
    {
      num: '7d',
      title: 'UPI payout after views clear',
      body: 'Verified views → 72-hour hold → UPI settled. No delays, no exceptions.',
    },
  ]
  return (
    <section className="section dark">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> The guarantees</span>
          <h2 className="display-2" style={{ color: 'white' }}>The numbers that <em>actually matter.</em></h2>
          <p className="lead">Three product facts that define every campaign on Wondeed.</p>
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
    { q: 'How does the league table work?', a: 'Clippers are ranked weekly by verified-view earnings. The table resets every Monday at 00:00 IST. All-time legends never reset — and the season Golden Boot pays ₹25,000.' },
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
      <SeasonTicker />
      <LeaguePreview />
      <GoldenBoot />
      <Matchday />
      <SeasonRules />
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
              <span className="sticker">Season 1 · Registrations open</span>
              <h1 className="display-1" style={{ marginTop: 26 }}>
                Clipping is a sport.<br />
                Get paid <em>like an athlete.</em>
              </h1>
              <p className="lead" style={{ marginTop: 28 }}>
                Wondeed turns brand campaigns into weekly drops. Clippers compete on the league table — every verified view earns real rupees, paid out over UPI.
              </p>
              <div className="hero-actions" style={{ marginTop: 36 }}>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Start clipping <Icon name="arrow-right" />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => router.push('/brands')}>
                  Fund a campaign
                </button>
              </div>
              <div className="live-ticker">
                <span className="live-pulse" />
                Weekly drops every Monday · 100% of budgets reach clippers · UPI payouts
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
