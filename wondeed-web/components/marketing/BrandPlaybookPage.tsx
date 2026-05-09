'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'

const PRINCIPLES = [
  {
    icon: 'target',
    t: 'Write a tight brief',
    d: 'The brief is everything. A vague brief produces vague clips. Specify: the hook you want, what to show in the first 3 seconds, the emotion you\'re going for, and what must never appear.',
  },
  {
    icon: 'play-circle',
    t: 'Set a realistic CPM',
    d: 'Higher CPM attracts more clippers and better clips. Standard tier is fine for broad niches. Competitive categories like Fintech or D2C Beauty need Medium or High rates to attract quality.',
  },
  {
    icon: 'clipboard',
    t: 'Provide a rich source pack',
    d: 'Include: brand logo (transparent PNG), product photos/video, approved soundtrack options, brand hex colours, and example clips you liked. The better the pack, the better the clips.',
  },
  {
    icon: 'shield-check',
    t: 'Use the 72-hour rejection window',
    d: 'You have 72 hours to reject any clip, no questions asked. A clip that misrepresents your brand shouldn\'t earn views. Rejection is free — paying for bad views is not.',
  },
]

const BRIEF_STEPS = [
  { n: '1', t: 'The hook', d: 'Tell clippers exactly what should happen in the first 2 seconds. "Show the product exploding into frame" is better than "make it exciting".' },
  { n: '2', t: 'The message', d: 'One message per clip. What should a viewer walk away knowing? Clippers can\'t convey three things in 30 seconds.' },
  { n: '3', t: 'Visual direction', d: 'Include example clips you liked. Describe the vibe: clean and minimal, fast-cut UGC, trending audio. Specificity beats creativity directives.' },
  { n: '4', t: 'Hard don\'ts', d: 'List what must never appear: competitor logos, certain colours, prohibited claims. Be explicit — clippers assume anything not banned is allowed.' },
]

export default function BrandPlaybookPage() {
  const router = useRouter()

  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Brand Playbook</span>
          <h1 className="display-1" style={{ marginTop: 22, color: 'white', maxWidth: '20ch' }}>
            How to run a campaign that actually works.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '56ch' }}>
            Best practices for briefs, budgets, and getting the most from your Wondeed campaign.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> Core principles</span>
            <h2 className="display-2">What separates high-performing campaigns.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {PRINCIPLES.map((p, i) => (
              <div className="card" key={i} style={{ padding: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--paper)', display: 'grid', placeItems: 'center', color: 'var(--green-2)', marginBottom: 18 }}>
                  <Icon name={p.icon} width={20} height={20} />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>{p.t}</div>
                <p style={{ marginTop: 8, color: 'var(--fg-mute)', fontSize: 14, lineHeight: 1.6 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow"><span className="dot" /> Brief writing</span>
            <h2 className="display-2">Writing a brief clippers will love.</h2>
            <p className="lead">Every great campaign starts with a clear brief. Here&apos;s how to write one that gets consistent, on-brand clips.</p>
          </div>
          <div className="steps-grid">
            {BRIEF_STEPS.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">STEP {s.n}</div>
                <div className="step-title">{s.t}</div>
                <p className="step-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="display-2" style={{ color: 'white', maxWidth: '22ch', margin: '0 auto' }}>Ready to run your first campaign?</h2>
          <p className="lead" style={{ marginTop: 16, marginInline: 'auto', maxWidth: '48ch' }}>
            Minimum ₹20,000 budget. 100% goes to clippers. Pay only for verified views.
          </p>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
              Start a campaign <Icon name="arrow-right" />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => router.push('/brands')}>
              How it works
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
