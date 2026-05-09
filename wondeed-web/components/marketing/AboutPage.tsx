'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { FinalSplitCTA } from './shared'

function AboutHero() {
  return (
    <section className="hero dark">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow"><span className="dot" /> About Us</span>
        <h1 className="display-1" style={{ marginTop: 22, color: 'white' }}>
          We&apos;re building the performance layer for short-form video in India.
        </h1>
        <p className="lead" style={{ marginTop: 28, maxWidth: '58ch' }}>
          Wondeed connects brands who need reach with creators who can generate it — and pays for results, not effort.
        </p>
      </div>
    </section>
  )
}

function AboutStory() {
  return (
    <section className="section white">
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow"><span className="dot" /> Why we built this</span>
        <h2 className="display-2" style={{ marginTop: 16 }}>The creator economy is broken for everyone except the top 0.1%.</h2>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18, color: 'var(--fg-mute)', fontSize: 17, lineHeight: 1.75 }}>
          <p>Brands spend millions on influencer deals — most of it wasted on reach that doesn&apos;t convert. Clippers spend hours editing for fixed fees that don&apos;t scale. Nobody in the middle is accountable for actual views.</p>
          <p>Wondeed fixes this with one rule: <strong style={{ color: 'var(--ink)' }}>pay only for verified views.</strong> Brands deposit a budget and set a CPM. Clippers pick campaigns, post Reels and Shorts on their own accounts, and get paid via UPI based on views confirmed by official platform APIs — not screenshots, not self-reported numbers.</p>
          <p>No agencies. No retainers. No minimums. A marketplace where performance is the only currency that matters.</p>
        </div>
      </div>
    </section>
  )
}

function AboutValues() {
  const values = [
    { icon: 'shield-check', t: 'Verified, not trusted', d: 'Every view is confirmed via the Instagram Graph API or YouTube Data API. We don\'t take anyone\'s word for it.' },
    { icon: 'wallet',       t: 'Pay for results',      d: 'Brands pay per verified view. Not per clip, not per creator, not per like. Outcomes, not effort.' },
    { icon: 'users',        t: 'Built for India',       d: 'UPI payouts, niche categories tuned to the Indian market. This isn\'t adapted for India — it\'s built here.' },
    { icon: 'sparkles',     t: 'Open to everyone',      d: 'Zero follower minimum. A brand-new account can earn as much as a 100K account if the clip hits.' },
  ]
  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot" /> What we stand for</span>
          <h2 className="display-2">Four principles. Non-negotiable.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {values.map((v, i) => (
            <div className="card" key={i} style={{ padding: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--green-2)', marginBottom: 18 }}>
                <Icon name={v.icon} width={20} height={20} />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em' }}>{v.t}</div>
              <p style={{ marginTop: 8, color: 'var(--fg-mute)', fontSize: 14, lineHeight: 1.6 }}>{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutTeam() {
  const router = useRouter()
  return (
    <section className="section dark">
      <div className="container" style={{ textAlign: 'center' }}>
        <span className="eyebrow"><span className="dot" /> The team</span>
        <h2 className="display-2" style={{ color: 'white', marginTop: 20, maxWidth: '24ch', margin: '20px auto 0' }}>Small team. Big conviction.</h2>
        <p className="lead" style={{ marginTop: 20, marginInline: 'auto', maxWidth: '52ch' }}>
          We&apos;re a small founding team building infrastructure for performance-based content in India. If this problem space excites you, we want to talk.
        </p>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/careers')}>
            See open roles <Icon name="arrow-right" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
      <FinalSplitCTA />
    </>
  )
}
