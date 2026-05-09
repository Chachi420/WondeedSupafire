'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'

const SECTIONS = [
  {
    id: 'getting-started',
    label: 'Getting started',
    steps: [
      { n: '1', t: 'Sign up with phone', d: 'Use your Indian mobile number. OTP login only — no email, no password. Add your UPI ID in settings immediately after signup for payouts.' },
      { n: '2', t: 'Connect your account', d: 'Link your Instagram or YouTube account. We request read-only access to your public media metrics. This is how views get verified — without it, you can\'t earn.' },
      { n: '3', t: 'Browse open campaigns', d: 'Campaigns appear in your dashboard filtered to your Tier. Each shows the brand, niche, CPM tier, brief summary, and a source pack download button.' },
      { n: '4', t: 'Read the full brief', d: 'Before starting any clip, read the brief end to end. It tells you: the hook, what to show, what to avoid, approved audio, and clip length. Ignoring the brief is the #1 reason for rejection.' },
    ],
  },
  {
    id: 'making-clips',
    label: 'Making clips',
    steps: [
      { n: '1', t: 'Hook in 2 seconds', d: 'The first 2 seconds determine whether someone keeps watching. Lead with a visual hook or a bold statement — not a logo or slow product shot.' },
      { n: '2', t: 'Use the brand\'s source media', d: 'Always use the source pack provided. Don\'t add stock footage or third-party assets unless explicitly allowed in the brief.' },
      { n: '3', t: 'Keep it 20–45 seconds', d: 'This range works best for Reels and Shorts. Longer clips get less completion. Lower completion means fewer verified views.' },
      { n: '4', t: 'Add captions', d: 'A large portion of Instagram views happen without sound. On-screen text or captions increase watch time and click-through significantly.' },
    ],
  },
  {
    id: 'submitting',
    label: 'Submitting & earning',
    steps: [
      { n: '1', t: 'Post on your account', d: 'Post the clip publicly on your linked Instagram or YouTube account. The account must be public and connected in Wondeed.' },
      { n: '2', t: 'Submit the clip URL', d: 'Paste the post URL in your Wondeed dashboard under the campaign. Our system verifies it matches your connected account.' },
      { n: '3', t: 'Wait for approval', d: 'We check the clip against the brief. Approval usually takes 24–48 hours. Approved clips start accumulating verified views immediately.' },
      { n: '4', t: 'Request payout via UPI', d: 'Views convert to earnings in real time. Once you cross ₹500, request a payout — it lands in your UPI within 7 days.' },
    ],
  },
]

const DOS = [
  'Read the full brief before starting',
  'Use the source media provided by the brand',
  'Add on-screen captions for sound-off viewers',
  'Hook hard in the first 2 seconds',
  'Keep clips between 20–45 seconds',
  'Post only from your connected public account',
]

const DONTS = [
  'Use copyrighted music not approved in the brief',
  'Show competitor products in the same clip',
  'Make misleading claims about the product',
  'Buy views or use engagement bots',
  'Submit the same clip to multiple campaigns',
  'Delete the clip while it\'s being view-tracked',
]

export default function CreatorGuidePage() {
  const router = useRouter()
  const [activeId, setActiveId] = useState('getting-started')
  const active = SECTIONS.find(s => s.id === activeId)!

  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Creator Guide</span>
          <h1 className="display-1" style={{ marginTop: 22, color: 'white', maxWidth: '22ch' }}>
            Everything you need to clip, post, and get paid.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '58ch' }}>
            From sign-up to your first UPI payout — a complete guide for new clippers.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={activeId === s.id ? 'btn btn-dark btn-sm' : 'btn btn-ghost btn-sm'}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="steps-grid">
            {active.steps.map((step, i) => (
              <div className="step" key={i}>
                <div className="step-num">STEP {step.n}</div>
                <div className="step-title">{step.t}</div>
                <p className="step-desc">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> Content rules</span>
            <h2 className="display-2">Dos and don&apos;ts.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green-2)', marginBottom: 16 }}>Do</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DOS.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green-2)', flexShrink: 0, marginTop: 1 }}><Icon name="check" width={14} height={14} /></span>
                    <span style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.5 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 28, background: 'var(--ink)', color: 'white' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,80,80,0.9)', marginBottom: 16 }}>Don&apos;t</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {DONTS.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,80,80,0.8)', flexShrink: 0, marginTop: 1 }}><Icon name="x" width={14} height={14} /></span>
                    <span style={{ fontSize: 14, color: 'var(--on-dark-2)', lineHeight: 1.5 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="display-2" style={{ color: 'white', maxWidth: '20ch', margin: '0 auto' }}>Ready to start clipping?</h2>
          <p className="lead" style={{ marginTop: 16, marginInline: 'auto', maxWidth: '46ch' }}>Sign up in 30 seconds. Pick your first campaign. Post. Get paid.</p>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
              Sign up with phone <Icon name="arrow-right" />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => router.push('/help')}>
              Help Center
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
