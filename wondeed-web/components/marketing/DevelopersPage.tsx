'use client'

import { useState } from 'react'
import Icon from './Icon'

const ENDPOINTS = [
  { method: 'GET',  path: '/v1/campaigns',      desc: 'List active campaigns for the authenticated clipper' },
  { method: 'POST', path: '/v1/submissions',     desc: 'Submit a clip URL against an open campaign' },
  { method: 'GET',  path: '/v1/earnings',        desc: 'Fetch earnings summary and payout history' },
  { method: 'GET',  path: '/v1/views/:clip_id',  desc: 'Get verified view count for a submitted clip' },
  { method: 'POST', path: '/v1/payouts/request', desc: 'Request a UPI payout for accumulated earnings' },
]

export default function DevelopersPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <>
      <section className="hero dark">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> Developers · API</span>
          <h1 className="display-1" style={{ marginTop: 22, color: 'white', maxWidth: '22ch' }}>
            Build on the Wondeed platform.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: '56ch' }}>
            A REST API for brands and clippers to integrate campaigns, view tracking, and payouts into their own tools. Now in private beta.
          </p>
        </div>
      </section>

      <section className="section white">
        <div className="container" style={{ display: 'flex', gap: 56, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span className="eyebrow"><span className="dot" /> What the API does</span>
            <h2 className="display-3" style={{ marginTop: 16 }}>Programmatic access to campaigns, views &amp; earnings.</h2>
            <p style={{ marginTop: 14, color: 'var(--fg-mute)', lineHeight: 1.7 }}>
              The Wondeed API lets you integrate campaign management, submission tracking, and verified view counts into your own tools. Useful for agencies running multiple brand accounts or power clippers building automation.
            </p>
            <div style={{ marginTop: 28, border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
              {ENDPOINTS.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 18px', borderBottom: i < ENDPOINTS.length - 1 ? '1px solid var(--hairline)' : 'none', background: i % 2 === 0 ? 'var(--paper)' : 'white' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 7px', borderRadius: 5, background: e.method === 'GET' ? 'rgba(240,78,35,0.12)' : 'rgba(80,100,255,0.1)', color: e.method === 'GET' ? 'var(--green-2)' : '#5060ff', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0, marginTop: 2 }}>{e.method}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg)' }}>{e.path}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 3 }}>{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '0 0 320px' }}>
            <div style={{ background: 'var(--ink)', borderRadius: 18, padding: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-dark-2)', marginBottom: 12 }}>Request API access</div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
                The API is in private beta. Enter your email and we&apos;ll reach out with credentials and docs when approved.
              </p>
              {!done ? (
                <form onSubmit={e => { e.preventDefault(); if (email) setDone(true) }}>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                  />
                  <button type="submit" className="btn btn-primary btn-block">
                    Request access <Icon name="arrow-right" />
                  </button>
                </form>
              ) : (
                <div style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.06em', padding: '10px 0' }}>
                  ✓ REQUEST RECEIVED — WE&apos;LL BE IN TOUCH
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
