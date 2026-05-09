'use client'

import { useState } from 'react'

export default function BlogPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="section dark" style={{ minHeight: '72vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <span className="eyebrow"><span className="dot" /> Blog</span>
        <h1 className="display-1" style={{ color: 'white', marginTop: 20, maxWidth: '22ch', margin: '20px auto 0' }}>
          Insights on performance content. Coming soon.
        </h1>
        <p className="lead" style={{ marginTop: 20, marginInline: 'auto', maxWidth: '50ch' }}>
          We&apos;ll write about CPM strategy, what makes a clip go viral, India&apos;s creator economy, and how brands can get more from short-form video.
        </p>
        {!done ? (
          <form
            onSubmit={e => { e.preventDefault(); if (email) setDone(true) }}
            style={{ marginTop: 32, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '12px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 15, minWidth: 260, outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary">Notify me</button>
          </form>
        ) : (
          <div style={{ marginTop: 32, color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.08em' }}>
            ✓ WE&apos;LL LET YOU KNOW
          </div>
        )}
      </div>
    </section>
  )
}
