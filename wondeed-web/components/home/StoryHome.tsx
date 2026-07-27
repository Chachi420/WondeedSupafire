'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'
import { HomeSections } from '@/components/marketing/HomePage'
import ScrollReveal from '@/components/marketing/ScrollReveal'
import Icon from '@/components/marketing/Icon'

/** smoothstep easing */
const ss = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** short Indian-units formatter: 48200 → 48.2K, 232000 → 2.3L */
function fmtShort(n: number): string {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(1).replace(/\.0$/, '') + 'Cr'
  if (n >= 100_000) return (n / 100_000).toFixed(1).replace(/\.0$/, '') + 'L'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

/* ── scene copy ─────────────────────────────────────────── */

interface SceneDef {
  id: string
  eyebrow: string
  title: string
  body: string
  flip?: boolean
  visual: React.ReactNode
}

/** css var helper — typed inline custom props */
const v = (a: number, d = 0.22) => ({ '--a': a, '--d': d } as React.CSSProperties)

function VisualUpload() {
  return (
    <div className="v-stack">
      <div className="v-card v-video" data-stage style={v(0.06)}>
        <div className="v-thumb">
          <span className="v-play" />
          <span className="v-dur">38:24</span>
        </div>
        <div className="v-video-meta">
          <strong>launch-keynote.mp4</strong>
          <span>1.2 GB · uploaded 9:41 PM</span>
        </div>
      </div>
      <div className="v-card v-brief" data-stage style={v(0.34)}>
        <div className="v-brief-head">Campaign brief</div>
        {[
          ['Budget', '₹2,00,000'],
          ['Rate', '₹90 / 1K verified views'],
          ['Niche', 'D2C Beauty'],
          ['Status', 'Open to clippers'],
        ].map(([l, r], i) => (
          <div className="v-row" key={i}>
            <span>{l}</span>
            <strong className={l === 'Status' ? 'v-green' : undefined}>{r}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const CLIPS = [
  { dur: '0:19', handle: '@riya.cuts', hook: '“We almost shut down in 2023”' },
  { dur: '0:27', handle: '@editbyarjun', hook: '“The ₹99 mistake everyone makes”' },
  { dur: '0:15', handle: '@kochi.clips', hook: '“Watch this before you buy skincare”' },
]

function VisualCut() {
  return (
    <div className="v-stack">
      <div className="v-card v-source" data-stage style={v(0.04)}>
        <span className="v-source-chip">SOURCE · 38:24</span>
        <span className="v-source-name">launch-keynote.mp4</span>
      </div>
      <div className="v-clips">
        {CLIPS.map((c, i) => (
          <div className="v-card v-clip" key={i} data-stage style={v(0.24 + i * 0.16)}>
            <div className="v-clip-thumb">
              <span className="v-play sm" />
              <span className="v-dur">{c.dur}</span>
            </div>
            <div className="v-clip-meta">
              <strong>{c.hook}</strong>
              <span>{c.handle} · subtitles · punch-ins</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PHONES = [
  { app: 'Reels', handle: '@riya.cuts', views: 48_200 },
  { app: 'Shorts', handle: '@editbyarjun', views: 121_000 },
  { app: 'Reels', handle: '@kochi.clips', views: 9_400 },
  { app: 'Shorts', handle: '@meme.mandi', views: 232_000 },
  { app: 'Reels', handle: '@cut.factory', views: 61_000 },
  { app: 'Reels', handle: '@desi.hooks', views: 18_700 },
]

function VisualSpread() {
  return (
    <div className="v-phone-grid">
      {PHONES.map((p, i) => (
        <div className="v-phone" key={i} data-stage style={v(0.08 + i * 0.1, 0.18)}>
          <span className={`v-app ${p.app === 'Shorts' ? 'yt' : ''}`}>{p.app}</span>
          <span className="v-play sm" />
          <div className="v-phone-foot">
            <span className="v-handle">{p.handle}</span>
            <strong className="v-views">
              <em data-count={p.views} data-at={0.12 + i * 0.1} data-fmt="short">0</em> views
            </strong>
          </div>
        </div>
      ))}
    </div>
  )
}

function VisualVerify() {
  return (
    <div className="v-stack">
      <div className="v-counter" data-stage style={v(0.05)}>
        <span data-count={1_240_000} data-at={0.1} data-dur={0.55}>0</span>
        <small>verified views · this campaign</small>
      </div>
      <div className="v-card v-verify" data-stage style={v(0.3)}>
        {[
          ['Instagram Graph API', '8,42,113', true],
          ['YouTube Data API', '3,97,887', true],
          ['Anomaly check', 'Passed', true],
          ['72-hour hold', 'Cleared', true],
        ].map(([l, r], i) => (
          <div className="v-row" key={i} data-stage style={v(0.36 + i * 0.09, 0.14)}>
            <span>{l}</span>
            <strong className="v-green">
              {r} <Icon name="shield-check" width={14} height={14} />
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAYOUTS = [
  { amt: '₹4,820', who: 'priya@okaxis', note: 'Glow Beauty campaign' },
  { amt: '₹1,260', who: 'arjun@ybl', note: 'Glow Beauty campaign' },
  { amt: '₹12,400', who: 'toptier@paytm', note: 'Tier 3 · fast-track' },
]

function VisualPayout() {
  return (
    <div className="v-stack">
      {PAYOUTS.map((p, i) => (
        <div className="v-card v-upi" key={i} data-stage style={v(0.08 + i * 0.16)}>
          <span className="v-upi-check">✓</span>
          <div className="v-upi-meta">
            <strong>{p.amt} credited</strong>
            <span>{p.who} · {p.note}</span>
          </div>
          <span className="v-upi-time">just now</span>
        </div>
      ))}
      <div className="v-total" data-stage style={v(0.62)}>
        <span>100% of the budget</span>
        <Icon name="arrow-right" width={16} height={16} />
        <strong>clippers</strong>
      </div>
    </div>
  )
}

const SCENES: SceneDef[] = [
  {
    id: 'upload',
    eyebrow: 'The upload',
    title: 'It starts with one video.',
    body: 'A founder podcast, a product demo, a 40-minute launch stream. Most of it will never be watched — until the right 20 seconds finds the right person.',
    visual: <VisualUpload />,
  },
  {
    id: 'cut',
    eyebrow: 'The cut',
    title: 'Clippers find the moments people actually watch.',
    body: 'Editors in Jaipur, Indore and Kochi pull out the hooks — 15-second cuts with subtitles and punch-ins. No agency, no retainer. Just people who are good at this.',
    flip: true,
    visual: <VisualCut />,
  },
  {
    id: 'spread',
    eyebrow: 'The spread',
    title: 'One brief becomes hundreds of Reels and Shorts.',
    body: 'Every clip goes live on a real creator’s handle — different niches, cities and audiences. Your story stops depending on any one account’s reach.',
    visual: <VisualSpread />,
  },
  {
    id: 'verify',
    eyebrow: 'Verified',
    title: 'Views you can trust, counted at the source.',
    body: 'Straight from the Instagram and YouTube APIs. Bot-checked, anomaly-flagged, and held for 72 hours before a single rupee moves.',
    flip: true,
    visual: <VisualVerify />,
  },
  {
    id: 'payout',
    eyebrow: 'The payout',
    title: 'Views become UPI in a clipper’s account.',
    body: '₹90 per thousand verified views, settled within 7 days. Wondeed never takes a cut of your campaign spend — we earn from subscriptions.',
    visual: <VisualPayout />,
  },
]

/* ── component ──────────────────────────────────────────── */

export default function StoryHome() {
  const router = useRouter()
  const storyRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const story = storyRef.current
    if (!story) return

    const scenes = Array.from(story.querySelectorAll<HTMLElement>('[data-scene]'))
    const counters = scenes.map(s => Array.from(s.querySelectorAll<HTMLElement>('[data-count]')))

    let ticking = false
    const update = () => {
      ticking = false
      const vh = window.innerHeight

      // story progress bar
      if (barRef.current) {
        const r = story.getBoundingClientRect()
        const total = r.height - vh
        const p = total > 0 ? clamp01(-r.top / total) : 1
        barRef.current.style.transform = `scaleX(${p})`
      }

      for (let i = 0; i < scenes.length; i++) {
        const rect = scenes[i].getBoundingClientRect()
        // skip scenes far outside the viewport
        if (rect.top > vh * 2 || rect.bottom < -vh) continue
        const total = rect.height - vh
        const p = total > 0 ? clamp01(-rect.top / total) : 1
        scenes[i].style.setProperty('--p', p.toFixed(4))

        for (const c of counters[i]) {
          const target = Number(c.dataset.count)
          const at = Number(c.dataset.at ?? 0.15)
          const dur = Number(c.dataset.dur ?? 0.4)
          const val = Math.floor(ss(clamp01((p - at) / dur)) * target)
          const text = c.dataset.fmt === 'short' ? fmtShort(val) : val.toLocaleString('en-IN')
          if (c.textContent !== text) c.textContent = text
        }
      }
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="mkt-wrap story-root">
      <div className="story-progress" aria-hidden="true"><div ref={barRef} /></div>
      <Nav />

      <div ref={storyRef}>
        {/* hero */}
        <section className="story-hero">
          <div className="container">
            <span className="eyebrow"><span className="dot" /> The performance clipping marketplace</span>
            <h1 className="story-h1">
              One video. A hundred clips.{' '}
              <span className="story-h1-green">Millions of real views.</span>
            </h1>
            <p className="story-sub">
              Brands put up a budget. Clippers across India cut it into Reels and Shorts.
              Every view is verified, and every rupee of the budget reaches a creator.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                Start a campaign <Icon name="arrow-right" />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => router.push('/clippers')}>
                I clip &amp; earn
              </button>
            </div>
            <div className="story-hint" aria-hidden="true">
              <span>Scroll — follow one video&apos;s journey</span>
              <span className="chev" />
            </div>
          </div>
        </section>

        {/* journey scenes */}
        {SCENES.map(s => (
          <section className={`scene ${s.flip ? 'scene-flip' : ''}`} key={s.id} data-scene>
            <div className="scene-pin">
              <div className="scene-inner container">
                <div className="scene-copy">
                  <span className="eyebrow" data-stage style={v(0.02, 0.14)}>
                    <span className="dot" /> {s.eyebrow}
                  </span>
                  <h2 className="scene-title" data-stage style={v(0.05, 0.16)}>{s.title}</h2>
                  <p className="scene-body" data-stage style={v(0.1, 0.16)}>{s.body}</p>
                </div>
                <div className="scene-visual">{s.visual}</div>
              </div>
            </div>
          </section>
        ))}

        {/* journey CTA */}
        <section className="story-cta">
          <div className="container">
            <div className="story-cta-card">
              <span className="eyebrow"><span className="dot" /> Your turn</span>
              <h2 className="scene-title" style={{ marginTop: 14 }}>
                Your video is one brief away from a hundred clips.
              </h2>
              <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
                <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
                  Start a campaign <Icon name="arrow-right" />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => router.push('/signup')}>
                  I clip &amp; earn
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* the grounded product sections */}
      <HomeSections />
      <Footer />
      <ScrollReveal />
    </div>
  )
}
