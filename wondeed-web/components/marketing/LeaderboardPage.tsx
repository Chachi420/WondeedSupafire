'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from './Icon'
import { fmtINR, FinalSplitCTA } from './shared'
import { rpcCall } from '@/lib/supabase/rpc'

/* ---------- types ---------- */

type Period = 'weekly' | 'all_time'
type Tier = 'rookie' | 'pro' | 'legend'

interface BoardRow {
  rank: number
  clipper_id: string
  display_name: string | null
  total_earned: number
  total_views: number
  submissions: number
  movement: number | null
  tier: Tier
}

/* ---------- helpers ---------- */

function fmtCompact(n: number): string {
  if (!n) return '0'
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`
  return String(Math.round(n))
}

function displayName(row: BoardRow): string {
  if (row.display_name && row.display_name.trim()) return row.display_name.trim()
  return `Clipper ${row.clipper_id.slice(0, 4)}`
}

function handleOf(row: BoardRow): string {
  return `clipper_${row.clipper_id.slice(0, 6).toLowerCase()}`
}

function Move({ m }: { m: number | null }) {
  if (m === null || m === undefined) return <span className="move-new">NEW</span>
  if (m > 0) return <span className="move move-up">▲{m}</span>
  if (m < 0) return <span className="move move-down">▼{-m}</span>
  return <span className="move move-same">•</span>
}

function TierChip({ tier }: { tier: Tier }) {
  const label = tier === 'legend' ? 'LEGEND' : tier === 'pro' ? 'PRO' : 'ROOKIE'
  return <span className={`tier-chip t-${tier}`}>{label}</span>
}

/* ---------- page ---------- */

export default function LeaderboardPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('weekly')
  const [rows, setRows] = useState<BoardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    rpcCall<BoardRow[]>('get_leaderboard', { p_period: period })
      .then(({ data, error }) => {
        if (cancelled) return
        // The RPC may not exist yet (created separately) — treat any
        // failure as an empty board (pre-season) rather than a broken page.
        if (!error && Array.isArray(data)) {
          setRows(data as BoardRow[])
        } else {
          if (error) console.warn('[leaderboard] rpc failed:', error.message)
          setRows([])
        }
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          console.warn('[leaderboard] rpc threw:', e)
          setRows([])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [period])

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow"><span className="dot" /> The standings</span>
          <h1 className="display-1" style={{ marginTop: 22 }}>
            League <span style={{ color: 'var(--gold)' }}>table.</span>
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            Ranked by verified-view earnings. The weekly board resets every Monday at 00:00 IST —
            climb fast, hold your ground. The all-time board is where legends are written.
          </p>
          <div className="hero-actions" style={{ marginTop: 36 }}>
            <button className="btn btn-primary" onClick={() => router.push('/signup')}>
              Start clipping <Icon name="arrow-right" />
            </button>
            <button className="btn btn-ghost" onClick={() => router.push('/clippers')}>
              How earning works
            </button>
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div className="tab-switch" role="tablist" aria-label="Leaderboard period">
              <button
                role="tab"
                aria-selected={period === 'weekly'}
                className={period === 'weekly' ? 'active' : ''}
                onClick={() => setPeriod('weekly')}
              >
                WEEKLY
              </button>
              <button
                role="tab"
                aria-selected={period === 'all_time'}
                className={period === 'all_time' ? 'active' : ''}
                onClick={() => setPeriod('all_time')}
              >
                ALL-TIME
              </button>
            </div>
          </div>

          {loading ? (
            <div className="league-table">
              <div className="empty-pitch" style={{ border: 'none' }}>
                <p>Loading the table…</p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="empty-pitch">
              <div className="ep-whistle" aria-hidden="true">◷</div>
              <h3>Pre-season</h3>
              <p>
                Season 1 hasn&apos;t kicked off yet. The first clippers on this board will be
                legends — early members earn a Founder badge.
              </p>
              <button className="btn btn-primary" onClick={() => router.push('/signup')}>
                Start clipping <Icon name="arrow-right" />
              </button>
            </div>
          ) : (
            <div className="league-table">
              <div className="lrow head">
                <span>#</span>
                <span>CLIPPER</span>
                <span className="lviews" style={{ textAlign: 'right' }}>VIEWS</span>
                <span className="learned" style={{ textAlign: 'right' }}>EARNED</span>
                <span className="lsub-hide" style={{ textAlign: 'right' }}>MOVE</span>
              </div>
              {rows.map((r) => (
                <div
                  key={r.clipper_id}
                  className={`lrow ${r.rank === 1 ? 'top1' : r.rank === 2 ? 'top2' : r.rank === 3 ? 'top3' : ''}`}
                >
                  <span><span className="rank-badge">{r.rank}</span></span>
                  <span className="lplayer">
                    <div className="lname">{displayName(r)}</div>
                    <div className="lsub">@{handleOf(r)} · <TierChip tier={r.tier} /></div>
                  </span>
                  <span className="lnum dim lviews">{fmtCompact(r.total_views)}</span>
                  <span className="lnum learned">{fmtINR(r.total_earned)}</span>
                  <span className="lsub-hide" style={{ textAlign: 'right' }}>
                    <Move m={r.movement} />
                  </span>
                </div>
              ))}
            </div>
          )}

          <p
            className="mono-note"
            style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: 1, color: 'var(--fg-mute)' }}
          >
            WEEKLY RESETS MONDAY 00:00 IST · RANKED BY VERIFIED-VIEW EARNINGS
          </p>
        </div>
      </section>

      <FinalSplitCTA />
    </>
  )
}
