'use client'

import Icon from './Icon'

const FACTS = [
  { l: 'Founded',   v: '2025' },
  { l: 'HQ',        v: 'India · Remote-first' },
  { l: 'Category',  v: 'Creator Economy / MarTech' },
  { l: 'Model',     v: 'Pay-per-verified-view' },
  { l: 'Payouts',   v: 'UPI' },
  { l: 'Platforms', v: 'Instagram Reels · YouTube Shorts' },
]

export default function PressPage() {
  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Press</span>
          <h1 className="display-1" style={{ color: 'white', marginTop: 22, maxWidth: '20ch' }}>
            Writing about Wondeed?
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '56ch' }}>
            We&apos;re an early-stage team building India&apos;s first performance-based
            clipping marketplace. If you&apos;re covering the creator economy, we&apos;d
            love to talk.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container" style={{ maxWidth: 680 }}>
          <span className="eyebrow"><span className="dot" /> Get in touch</span>
          <h2 className="display-3" style={{ marginTop: 16 }}>One inbox, real humans.</h2>
          <p style={{ marginTop: 12, color: 'var(--fg-mute)', lineHeight: 1.7, fontSize: 16 }}>
            For interviews, questions about the model, or logo and screenshot
            requests, write to us — the founders read every mail.
          </p>
          <a href="mailto:hello@wondeed.com" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            hello@wondeed.com <Icon name="arrow-right" />
          </a>
        </div>
      </section>

      <section className="section paper">
        <div className="container" style={{ maxWidth: 680 }}>
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> Fast facts</span>
            <h2 className="display-2">Company at a glance.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FACTS.map((f, i) => (
              <div key={i} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-mute)', marginBottom: 6 }}>{f.l}</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
