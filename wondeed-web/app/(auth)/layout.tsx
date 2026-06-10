import Link from 'next/link'

function PointIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const POINTS = [
  {
    title: 'Pay only for verified views',
    desc: 'Views pulled straight from the Instagram and YouTube APIs. No views, no charge.',
    d: 'M22 12s-4-7-10-7S2 12 2 12s4 7 10 7 10-7 10-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
  },
  {
    title: '100% of budgets reach clippers',
    desc: 'Wondeed earns from subscriptions — never a cut of your campaign spend.',
    d: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  },
  {
    title: 'UPI payouts within 7 days',
    desc: 'Earnings clear a 72-hour hold, then settle directly to your UPI ID.',
    d: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <aside className="auth-brand-panel">
        <Link href="/" className="auth-logo">
          <span className="mark">W</span>
          Wondeed
        </Link>

        <div className="auth-brand-body">
          <span className="auth-eyebrow"><span className="dot" /> Performance clipping marketplace</span>
          <h1 className="auth-headline">
            Where brands buy <em>views</em>, not promises.
          </h1>
          <p className="auth-sub">
            Brands fund campaigns. Clippers turn them into Reels and Shorts.
            Everyone gets paid on verified results.
          </p>

          <div className="auth-points">
            {POINTS.map(p => (
              <div className="auth-point" key={p.title}>
                <span className="pt-ico"><PointIcon d={p.d} /></span>
                <div>
                  <div className="pt-title">{p.title}</div>
                  <div className="pt-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-brand-foot">
          <div>
            <div className="f-num">₹20K<span>+</span></div>
            <div className="f-lbl">Minimum campaign</div>
          </div>
          <div>
            <div className="f-num">0</div>
            <div className="f-lbl">Follower minimum</div>
          </div>
          <div>
            <div className="f-num">7<span>d</span></div>
            <div className="f-lbl">UPI payout window</div>
          </div>
        </div>
      </aside>

      <section className="auth-form-panel">
        <div className="auth-form-head">
          <Link href="/" className="auth-mobile-logo">
            <span className="mark">W</span>
            Wondeed
          </Link>
          <span>Back to</span>
          <Link href="/">wondeed.com →</Link>
        </div>
        <div className="auth-form-body">
          {children}
        </div>
      </section>
    </main>
  )
}
