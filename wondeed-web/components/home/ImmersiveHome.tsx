'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'
import HomePage from '@/components/marketing/HomePage'
import ScrollReveal from '@/components/marketing/ScrollReveal'
import type { ExperienceHandle } from './three/engine'

/** total scroll length of the journey */
const JOURNEY_VH = 840

/** smoothstep */
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

interface OverlayDef {
  id: string
  /** visible window in global progress */
  enter: number
  exit: number
  align: 'center' | 'left' | 'right'
  eyebrow?: string
  title: React.ReactNode
  body?: string
}

const OVERLAYS: OverlayDef[] = [
  {
    id: 'stream',
    enter: 0.115, exit: 0.245, align: 'left',
    eyebrow: 'The stream',
    title: <>Every brand is a signal<br />lost in the noise.</>,
    body: 'Millions of videos fight for the same eyes. Attention doesn\'t scale by shouting louder — it scales by multiplying.',
  },
  {
    id: 'cut',
    enter: 0.27, exit: 0.385, align: 'right',
    eyebrow: 'The cut',
    title: <>Clippers find the moment<br />worth watching.</>,
    body: 'One long video holds a hundred hooks. Editors across India cut it into Reels and Shorts that actually land.',
  },
  {
    id: 'swarm',
    enter: 0.42, exit: 0.535, align: 'left',
    eyebrow: 'The swarm',
    title: <>One brief becomes<br />hundreds of clips.</>,
    body: 'Your story spreads across real creator handles — niches and audiences you could never buy your way into.',
  },
  {
    id: 'verify',
    enter: 0.57, exit: 0.665, align: 'center',
    eyebrow: 'Verified',
    title: <>No estimates.<br />No vanity. Just views.</>,
    body: 'Counted straight from the Instagram and YouTube APIs, anomaly-checked, held 72 hours before a rupee moves.',
  },
  {
    id: 'payout',
    enter: 0.70, exit: 0.80, align: 'right',
    eyebrow: 'The payout',
    title: <>Views become rupees.<br />Rupees become UPI.</>,
    body: '100% of every campaign budget reaches the clippers. Wondeed never takes a cut of your spend.',
  },
]

export default function ImmersiveHome() {
  const [mode, setMode] = useState<'immersive' | 'classic'>('immersive')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ExperienceHandle | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (mode !== 'immersive') return

    // fallbacks: reduced motion or no WebGL → classic site
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('classic')
      return
    }
    try {
      const test = document.createElement('canvas')
      const gl = test.getContext('webgl2') || test.getContext('webgl')
      if (!gl) { setMode('classic'); return }
    } catch { setMode('classic'); return }

    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let cleanupFns: (() => void)[] = []

    // GPU context lost (tab restore, driver reset) → graceful classic fallback
    const onContextLost = (e: Event) => {
      e.preventDefault()
      setMode('classic')
    }
    canvas.addEventListener('webglcontextlost', onContextLost)
    cleanupFns.push(() => canvas.removeEventListener('webglcontextlost', onContextLost))

    // dark chrome while travelling + native scroll (smooth-scroll fights the camera rig)
    const root = document.documentElement
    const prevBg = root.style.background
    const prevScrollBehavior = root.style.scrollBehavior
    root.style.background = '#06091B'
    root.style.scrollBehavior = 'auto'
    cleanupFns.push(() => {
      root.style.background = prevBg
      root.style.scrollBehavior = prevScrollBehavior
    })

    import('./three/engine').then(({ createExperience }) => {
      if (cancelled || !canvasRef.current) return
      const engine = createExperience(canvas)
      engineRef.current = engine

      const onResize = () => engine.resize()
      window.addEventListener('resize', onResize)
      cleanupFns.push(() => window.removeEventListener('resize', onResize))

      const onPointer = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        engine.setPointer(
          (e.clientX / window.innerWidth) * 2 - 1,
          (e.clientY / window.innerHeight) * 2 - 1
        )
      }
      window.addEventListener('pointermove', onPointer)
      cleanupFns.push(() => window.removeEventListener('pointermove', onPointer))

      // overlay + progress loop
      let raf = 0
      const tick = () => {
        raf = requestAnimationFrame(tick)
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        engine.setProgress(p)

        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`

        if (heroRef.current) {
          const o = 1 - ss(0.04, 0.105, p)
          heroRef.current.style.opacity = String(o)
          heroRef.current.style.visibility = o <= 0.01 ? 'hidden' : 'visible'
          heroRef.current.style.transform = `translateY(${-ss(0.0, 0.105, p) * 60}px)`
        }
        if (hintRef.current) {
          hintRef.current.style.opacity = String(1 - ss(0.005, 0.05, p))
        }
        if (counterRef.current) {
          const local = ss(0.565, 0.655, p)
          const views = Math.floor(local * local * 12_400_000)
          const text = views.toLocaleString('en-IN')
          if (counterRef.current.textContent !== text) {
            counterRef.current.textContent = text
          }
        }
        OVERLAYS.forEach((ov, i) => {
          const el = overlayRefs.current[i]
          if (!el) return
          const o = Math.min(ss(ov.enter, ov.enter + 0.035, p), 1 - ss(ov.exit - 0.035, ov.exit, p))
          el.style.opacity = String(o)
          el.style.visibility = o <= 0.01 ? 'hidden' : 'visible'
          const drift = (1 - o) * 26
          el.style.transform = `translateY(${drift}px)`
        })
        if (ctaRef.current) {
          const o = ss(0.86, 0.93, p)
          ctaRef.current.style.opacity = String(o)
          ctaRef.current.style.visibility = o <= 0.01 ? 'hidden' : 'visible'
          ctaRef.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
          ctaRef.current.style.transform = `translateY(${(1 - o) * 40}px) scale(${0.96 + o * 0.04})`
        }
      }
      raf = requestAnimationFrame(tick)
      cleanupFns.push(() => cancelAnimationFrame(raf))
    })

    return () => {
      cancelled = true
      for (const fn of cleanupFns) fn()
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [mode])

  if (mode === 'classic') {
    return (
      <div className="mkt-wrap">
        <Nav />
        <HomePage />
        <Footer />
        <ScrollReveal />
      </div>
    )
  }

  const skipToEnd = () => {
    window.scrollTo(0, document.documentElement.scrollHeight)
  }

  return (
    <div className="imm-root">
      <canvas ref={canvasRef} className="imm-canvas" aria-hidden="true" />
      <div className="imm-vignette" aria-hidden="true" />

      {/* chrome */}
      <header className="imm-chrome">
        <Link href="/" className="imm-logo">
          <span className="mark">W</span> Wondeed
        </Link>
        <div className="imm-chrome-right">
          <Link href="/login" className="imm-chrome-link">Log in</Link>
          <button type="button" className="imm-skip" onClick={skipToEnd}>
            Skip journey →
          </button>
        </div>
      </header>
      <div className="imm-progress" aria-hidden="true"><div ref={barRef} /></div>

      {/* hero */}
      <div className="imm-overlay imm-center" ref={heroRef}>
        <div className="imm-copy">
          <span className="imm-eyebrow"><span className="dot" /> A performance clipping marketplace</span>
          <h1 className="imm-hero-title">
            Enter the<br /><em>clip dimension.</em>
          </h1>
          <p className="imm-hero-sub">
            Brands fund stories. Clippers multiply them. Every view is verified,
            every rupee reaches a creator. Scroll to travel the journey of one video.
          </p>
        </div>
      </div>
      <div className="imm-hint" ref={hintRef} aria-hidden="true">
        <span className="imm-hint-mouse">Scroll to begin</span>
        <span className="imm-hint-touch">Swipe up to begin</span>
        <span className="chev" />
      </div>

      {/* journey copy */}
      {OVERLAYS.map((ov, i) => (
        <div
          key={ov.id}
          ref={el => { overlayRefs.current[i] = el }}
          className={`imm-overlay imm-${ov.align}`}
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div className="imm-copy">
            {ov.eyebrow && <span className="imm-eyebrow"><span className="dot" /> {ov.eyebrow}</span>}
            {ov.id === 'verify' && (
              <div className="imm-counter" aria-hidden="true">
                <span ref={counterRef}>0</span>
                <small>verified views</small>
              </div>
            )}
            <h2 className="imm-title">{ov.title}</h2>
            {ov.body && <p className="imm-body">{ov.body}</p>}
          </div>
        </div>
      ))}

      {/* final CTA */}
      <div className="imm-overlay imm-center" ref={ctaRef} style={{ opacity: 0, visibility: 'hidden' }}>
        <div className="imm-cta-card">
          <span className="imm-eyebrow"><span className="dot" /> The horizon</span>
          <h2 className="imm-title" style={{ marginTop: 14 }}>
            Your story is waiting<br />to be multiplied.
          </h2>
          <div className="imm-cta-actions">
            <Link href="/signup" className="imm-btn imm-btn-primary">Start a campaign →</Link>
            <Link href="/signup" className="imm-btn imm-btn-ghost">I clip &amp; earn</Link>
          </div>
          <nav className="imm-cta-links" aria-label="Site">
            <Link href="/brands">For Brands</Link>
            <Link href="/clippers">For Clippers</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/trust">Trust</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
      </div>

      {/* scroll length */}
      <div style={{ height: `${JOURNEY_VH}vh` }} aria-hidden="true" />
    </div>
  )
}
