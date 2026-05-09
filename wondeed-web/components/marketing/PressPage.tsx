'use client'

import Icon from './Icon'

const FACTS = [
  { l: 'Founded',       v: '2025' },
  { l: 'HQ',           v: 'India · Remote-first' },
  { l: 'Category',     v: 'Creator Economy / MarTech' },
  { l: 'Model',        v: 'Pay-per-verified-view' },
  { l: 'Payments',     v: 'UPI via Razorpay' },
  { l: 'Entity',       v: 'Wondeed Technologies Pvt. Ltd.' },
]

export default function PressPage() {
  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Press</span>
          <h1 className="display-1" style={{ color: 'white', marginTop: 22, maxWidth: '20ch' }}>
            Media kit &amp; press resources.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '56ch' }}>
            For press inquiries, interviews, and brand assets related to Wondeed.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container" style={{ display: 'flex', gap: 56, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <span className="eyebrow"><span className="dot" /> Press contact</span>
            <h2 className="display-3" style={{ marginTop: 16 }}>Reach our press team.</h2>
            <p style={{ marginTop: 12, color: 'var(--fg-mute)', lineHeight: 1.7, fontSize: 16 }}>
              For interviews, embargoed announcements, and media requests. We respond to press queries within 24 hours.
            </p>
            <a href="mailto:press@wondeed.com" className="btn btn-dark" style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              press@wondeed.com <Icon name="arrow-right" />
            </a>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <span className="eyebrow"><span className="dot" /> Brand assets</span>
            <h2 className="display-3" style={{ marginTop: 16 }}>Logo &amp; brand kit.</h2>
            <p style={{ marginTop: 12, color: 'var(--fg-mute)', lineHeight: 1.7, fontSize: 16 }}>
              Download our official logos, brand colours, and usage guidelines. Please read guidelines before publishing.
            </p>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 24 }}
              onClick={() => { window.location.href = 'mailto:press@wondeed.com?subject=Brand Kit Request' }}
            >
              Request brand kit <Icon name="arrow-right" />
            </button>
          </div>
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
