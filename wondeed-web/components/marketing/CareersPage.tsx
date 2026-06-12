'use client'

import { useState } from 'react'
import Icon from './Icon'

const ROLES = [
  {
    title: 'Full-Stack Engineer',
    team: 'Engineering',
    type: 'Full-time · Remote',
    desc: 'Own the brand and clipper dashboards. Next.js 16, Supabase, TypeScript. You ship features end-to-end — no hand-offs, no tickets you didn\'t write yourself.',
  },
  {
    title: 'Growth & Partnerships',
    team: 'Growth',
    type: 'Full-time · India',
    desc: 'Sign the first 50 brands. Own acquisition from cold outreach to first deposit. Compensation is base + performance.',
  },
  {
    title: 'Clipper Community Manager',
    team: 'Operations',
    type: 'Full-time · Remote',
    desc: 'Grow and support the clipper community. Run onboarding, moderate content quality, handle payout queries. The first line between the platform and thousands of creators.',
  },
]

export default function CareersPage() {
  const [open, setOpen] = useState<number | null>(null)

  const perks = [
    { icon: 'zap',      t: 'Fully remote',        d: 'Work from anywhere in India.' },
    { icon: 'sparkles', t: 'Equity from day one', d: 'Real ownership in what we\'re building.' },
    { icon: 'flag',     t: 'Ship fast',            d: 'No red tape. Your work goes live in days.' },
    { icon: 'users',    t: 'Small team',           d: 'Your ideas reach the founders directly.' },
  ]

  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Careers</span>
          <h1 className="display-1" style={{ marginTop: 22, color: 'white', maxWidth: '22ch' }}>
            Help build India&apos;s first performance clipping marketplace.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '58ch' }}>
            We&apos;re early-stage, fully remote, and moving fast. If you want to own outcomes — not tasks — this might be for you.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> Open roles</span>
            <h2 className="display-2">What we&apos;re hiring for.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map((r, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em', color: 'var(--fg)' }}>{r.title}</div>
                    <div style={{ marginTop: 4, fontSize: 13, color: 'var(--fg-mute)', display: 'flex', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.team}</span>
                      <span>·</span><span>{r.type}</span>
                    </div>
                  </div>
                  <Icon name={open === i ? 'minus' : 'plus'} />
                </button>
                {open === i && (
                  <div style={{ borderTop: '1px solid var(--hairline)', padding: '20px 24px', background: 'var(--paper)' }}>
                    <p style={{ color: 'var(--fg-mute)', lineHeight: 1.65, marginBottom: 18 }}>{r.desc}</p>
                    <a
                      href={`mailto:team@wondeed.com?subject=Application: ${r.title}`}
                      className="btn btn-dark"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                      Apply via email <Icon name="arrow-right" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--fg-mute)' }}>
            Don&apos;t see your role?{' '}
            <a href="mailto:team@wondeed.com" style={{ color: 'var(--fg)', fontWeight: 600 }}>Email us</a>
            {' '}with what you&apos;d build.
          </p>
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> How we work</span>
            <h2 className="display-2">Outcomes over process.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {perks.map((p, i) => (
              <div className="card" key={i} style={{ padding: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--green-2)', marginBottom: 14 }}>
                  <Icon name={p.icon} width={18} height={18} />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 17 }}>{p.t}</div>
                <p style={{ marginTop: 6, color: 'var(--fg-mute)', fontSize: 13.5, lineHeight: 1.5 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
