import Link from 'next/link'
import Icon from './Icon'
import { FAQItem, FinalSplitCTA } from './shared'

function LeagueHeroVisual() {
  const slots = [1, 2, 3]
  return (
    <div aria-hidden="true">
      <div className="league-table">
        <div className="lrow head">
          <span>Rk</span>
          <span>Clipper</span>
          <span style={{ textAlign: 'right' }}>Views</span>
          <span style={{ textAlign: 'right' }}>Earned</span>
          <span style={{ textAlign: 'right' }}>Form</span>
        </div>
        {slots.map(rank => (
          <div className={`lrow ${rank === 1 ? 'top1' : rank === 2 ? 'top2' : 'top3'}`} key={rank}>
            <span><span className="rank-badge">{rank}</span></span>
            <span className="lplayer">
              <span className="lname" style={{ color: 'var(--fg-faint)' }}>— vacant —</span>
              <span className="lsub">SEASON 1 · PRE-SEASON</span>
            </span>
            <span className="lnum dim lviews">–</span>
            <span className="lnum dim learned">–</span>
            <span className="move move-new">NEW</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.4px', color: 'var(--fg-mute)', textAlign: 'center' }}>
        SEASON 1 TABLE — FILLS AS CLIPPERS EARN
      </p>
    </div>
  )
}

function ClippersHero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> For clippers · Season 1</span>
            <h1 className="display-1" style={{ marginTop: 22 }}>
              Join the league.<br />
              <span style={{ color: 'var(--persimmon)' }}>Get paid per view.</span>
            </h1>
            <p className="lead" style={{ marginTop: 28 }}>
              Pick from weekly campaign drops, post clips on your own account, earn real rupees for every verified view — paid out over UPI.
            </p>
            <div className="hero-actions" style={{ marginTop: 36 }}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start clipping <Icon name="arrow-right" />
              </Link>
              <Link href="/leaderboard" className="btn btn-ghost btn-lg">
                See the standings
              </Link>
            </div>
          </div>
          <LeagueHeroVisual />
        </div>
      </div>
    </section>
  )
}

interface Tier {
  chip: string
  chipClass: string
  title: string
  desc: string
  bullets: string[]
}

function TiersSection() {
  const tiers: Tier[] = [
    {
      chip: 'Rookie',
      chipClass: 't-rookie',
      title: 'Lifetime under ₹5,000',
      desc: 'Everyone starts here. No tryouts, no follower count, no application — just pick a drop and post.',
      bullets: [
        'Access to all open weekly drops',
        'Standard per-view rates',
        'UPI payouts once you cross ₹500',
      ],
    },
    {
      chip: 'Pro',
      chipClass: 't-pro',
      title: '₹5,000+ lifetime earned',
      desc: "You've proven you can pull views. The league opens up — better briefs, better caps.",
      bullets: [
        'Priority access to new drops',
        'Higher per-view caps',
        'Medium and high-earning niches',
      ],
    },
    {
      chip: 'Legend',
      chipClass: 't-legend',
      title: '₹50,000+ lifetime earned',
      desc: 'The top table. Brands come to you, and the Golden Boot is in play.',
      bullets: [
        'Exclusive brand deals',
        'Golden Boot contention',
        'Verified badge on your profile',
      ],
    },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Know your division</span>
          <h2 className="display-2">Three divisions. One way up.</h2>
          <p className="lead">
            Divisions are decided by lifetime verified earnings — never bought, never applied for. You climb by posting.
          </p>
        </div>
        <div className="why-grid">
          {tiers.map((t, i) => (
            <div
              key={i}
              style={{
                background: '#FFFDF8',
                border: '2.5px solid var(--ink)',
                borderRadius: 20,
                boxShadow: '5px 5px 0 rgba(28,21,48,0.9)',
                padding: 28,
              }}
            >
              <span className={`tier-chip ${t.chipClass}`}>{t.chip}</span>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 21, letterSpacing: '-0.01em', margin: '18px 0 8px' }}>
                {t.title}
              </h3>
              <p style={{ color: 'var(--fg-mute)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 18px' }}>{t.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {t.bullets.map((b, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{ color: 'var(--persimmon)', flexShrink: 0, marginTop: 1 }}>
                      <Icon name="check" width={15} height={15} />
                    </span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SeasonRules() {
  const rules = [
    {
      kicker: 'Rule 01',
      title: 'Pick your match',
      desc: 'Browse the weekly drop and claim a campaign that fits your style. First come, first served — no assignments, no middlemen.',
    },
    {
      kicker: 'Rule 02',
      title: 'Post your clip',
      desc: 'Cut it your way in any editor, post the Reel or Short on your own account, and submit the link. Your audience, your edit.',
    },
    {
      kicker: 'Rule 03',
      title: 'Get paid per view',
      desc: 'Views are verified through official platform APIs. Earnings land in your wallet — cash out over UPI once you cross ₹500.',
    },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Season rules</span>
          <h2 className="display-2">Three rules. That&apos;s the whole game.</h2>
        </div>
        <div className="season-rules">
          {rules.map((r, i) => (
            <div className="rule-card" key={i}>
              <div className="rule-num">{i + 1}</div>
              <div className="rule-kicker">{r.kicker}</div>
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrophyGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#1C1530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function GoldenBoot() {
  const stats = [
    { num: '–', lab: 'Views' },
    { num: '–', lab: 'Earned' },
    { num: '₹25K', lab: 'Bonus' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="golden-boot">
          <div className="boot-trophy" aria-hidden="true">
            <TrophyGlyph />
          </div>
          <div>
            <h3>The <em>Golden Boot</em></h3>
            <p>
              Most verified views in a season takes the Boot — plus a ₹25,000 bonus on top of regular per-view earnings. One winner, every season.
            </p>
            <div className="boot-stats">
              {stats.map((s, i) => (
                <div className="boot-stat" key={i}>
                  <div className="bs-num">{s.num}</div>
                  <div className="bs-lab">{s.lab}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--gold)' }}>
              NO HOLDER YET — IT COULD BE YOU
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClipperFAQ() {
  const faqs = [
    {
      q: 'How are my views verified?',
      a: "We pull view counts directly from Instagram's Graph API and YouTube's Data API on your public post — not screenshots, not self-reports. An anomaly check filters out bot spikes, and a 72-hour holding period lets the numbers settle before they become earnings.",
    },
    {
      q: 'When do payouts happen?',
      a: 'Earnings unlock after the holding period. Once your wallet crosses ₹500, request a payout and it lands in your UPI ID within 7 days. No fees from our side.',
    },
    {
      q: 'Do I need followers to join?',
      a: 'No. Zero followers is fine — divisions are decided by verified views on your clips, not the size of your audience. A brand-new account can win the Golden Boot.',
    },
    {
      q: 'What content is allowed?',
      a: "Original cuts made by you for the campaign brief — no re-uploads of other creators' work, no music you don't have rights to, nothing that breaks platform policies. Repeat violations drop you down a division.",
    },
  ]
  return (
    <section className="section white">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> Clipper FAQ</span>
          <h2 className="display-2">Asked from the stands.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  )
}

export default function ClippersPage() {
  return (
    <>
      <ClippersHero />
      <TiersSection />
      <SeasonRules />
      <GoldenBoot />
      <ClipperFAQ />
      <FinalSplitCTA />
    </>
  )
}
