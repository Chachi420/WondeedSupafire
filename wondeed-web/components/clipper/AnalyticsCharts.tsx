'use client'

import { useState } from 'react'

type DailyEarning = { date: string; amount: number }
type DailyView    = { date: string; views: number }
type PlatformStat = { platform: string; views: number; earnings: number }

type Props = {
  dailyEarnings: DailyEarning[]
  cumulativeViews: DailyView[]
  platformStats: PlatformStat[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

type Period = 'day' | 'week' | 'month'

function groupByPeriod(daily: DailyEarning[], period: Period): DailyEarning[] {
  if (period === 'day') return daily.slice(-30)

  const buckets = new Map<string, number>()
  for (const d of daily) {
    const date = new Date(d.date)
    let key: string
    if (period === 'week') {
      const dayOfWeek = date.getDay()
      const monday    = new Date(date)
      monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7))
      key = monday.toISOString().slice(0, 10)
    } else {
      key = d.date.slice(0, 7)
    }
    buckets.set(key, (buckets.get(key) ?? 0) + d.amount)
  }
  return Array.from(buckets.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)
}

function BarChart({ data }: { data: DailyEarning[] }) {
  const maxVal = Math.max(...data.map(d => d.amount), 1)

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--fg-muted)', fontSize: 14 }}>
        No earnings data yet
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
      {data.map((d, i) => {
        const heightPct = (d.amount / maxVal) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
            <div
              style={{
                width: '100%',
                borderRadius: '3px 3px 0 0',
                background: 'var(--primary)',
                minHeight: 2,
                height: `${heightPct}%`,
                opacity: 0.7,
                transition: 'opacity 0.1s',
              }}
              title={fmt(d.amount)}
            />
            <span style={{ fontSize: 9, color: 'var(--fg-muted)', transform: 'rotate(45deg) translateX(2px)', transformOrigin: 'left', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
              {d.date.slice(5)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ data }: { data: DailyView[] }) {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--fg-muted)', fontSize: 14 }}>
        No view data yet
      </div>
    )
  }

  const maxVal  = Math.max(...data.map(d => d.views), 1)
  const W = 600, H = 140, PAD = 10

  const points = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - 2 * PAD),
    y: PAD + (1 - d.views / maxVal) * (H - 2 * PAD),
    views: d.views,
    date:  d.date,
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `M ${points[0].x} ${H} ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#viewsGrad)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981">
          <title>{fmtViews(p.views)} views on {p.date}</title>
        </circle>
      ))}
    </svg>
  )
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#ec4899',
  youtube:   '#ef4444',
  x:         '#111827',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube:   'YouTube',
  x:         'X (Twitter)',
}

export default function AnalyticsCharts({ dailyEarnings, cumulativeViews, platformStats }: Props) {
  const [period, setPeriod] = useState<Period>('day')

  const grouped    = groupByPeriod(dailyEarnings, period)
  const totalViews = platformStats.reduce((s, p) => s + p.views, 0) || 1

  const allPlatforms: PlatformStat[] = [
    ...platformStats,
    ...(['instagram', 'youtube', 'x'] as const)
      .filter(p => !platformStats.find(s => s.platform === p))
      .map(p => ({ platform: p, views: 0, earnings: 0 })),
  ]

  return (
    <div className="col gap-16">

      {/* Cumulative views chart */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Cumulative Views</h2>
            <div className="sub">Running total of capped views across all approved clips</div>
          </div>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <LineChart data={cumulativeViews} />
          <div className="row between mt-8">
            <span className="text-xs faint">Earliest submission</span>
            <span className="text-xs faint">Latest</span>
          </div>
        </div>
      </div>

      {/* Earnings bar chart */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Earnings</h2>
            <div className="sub">Breakdown by period</div>
          </div>
          <div className="card-head-right">
            <div className="segmented">
              {(['day', 'week', 'month'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`seg-item${period === p ? ' active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <BarChart data={grouped} />
        </div>
      </div>

      {/* Platform breakdown */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Platform Breakdown</h2>
            <div className="sub">Views and earnings by platform</div>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }} className="col gap-20">
          {allPlatforms.map((p) => {
            const pct = totalViews > 0 ? Math.round((p.views / totalViews) * 100) : 0
            const color = PLATFORM_COLORS[p.platform] ?? 'var(--fg-muted)'
            return (
              <div key={p.platform}>
                <div className="row between mb-8">
                  <div className="row gap-8">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span className="med text-xs">{PLATFORM_LABELS[p.platform] ?? p.platform}</span>
                  </div>
                  <div className="row gap-16 text-xs">
                    <span className="faint">{fmtViews(p.views)} views</span>
                    <span className="med">{fmt(p.earnings)}</span>
                  </div>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="text-xs faint mt-4">{pct}% of total views</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
