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
      key = d.date.slice(0, 7) // YYYY-MM
    }
    buckets.set(key, (buckets.get(key) ?? 0) + d.amount)
  }
  return Array.from(buckets.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)
}

function BarChart({ data, label }: { data: DailyEarning[]; label: string }) {
  const maxVal = Math.max(...data.map(d => d.amount), 1)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No earnings data yet
      </div>
    )
  }

  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d, i) => {
        const heightPct = (d.amount / maxVal) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {fmt(d.amount)}
            </div>
            <div
              className="w-full rounded-t bg-emerald-500 group-hover:bg-emerald-600 transition-colors min-h-[2px]"
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] text-gray-400 rotate-45 origin-left translate-x-1 truncate w-full">
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
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
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
  instagram: 'bg-pink-500',
  youtube:   'bg-red-500',
  moj:       'bg-orange-400',
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube:   'YouTube',
  moj:       'Moj',
}

export default function AnalyticsCharts({ dailyEarnings, cumulativeViews, platformStats }: Props) {
  const [period, setPeriod] = useState<Period>('day')

  const grouped    = groupByPeriod(dailyEarnings, period)
  const totalViews = platformStats.reduce((s, p) => s + p.views, 0) || 1

  const allPlatforms: PlatformStat[] = [
    ...platformStats,
    ...(['instagram', 'youtube', 'moj'] as const)
      .filter(p => !platformStats.find(s => s.platform === p))
      .map(p => ({ platform: p, views: 0, earnings: 0 })),
  ]

  return (
    <div className="space-y-6">

      {/* Cumulative views chart */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Cumulative Views</h2>
          <p className="text-xs text-gray-400 mt-0.5">Running total of capped views across all approved clips</p>
        </div>
        <div className="px-5 py-4">
          <LineChart data={cumulativeViews} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">Earliest submission</span>
            <span className="text-xs text-gray-400">Latest</span>
          </div>
        </div>
      </div>

      {/* Earnings bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Earnings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Breakdown by period</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'day' ? 'Daily' : p === 'week' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 py-4">
          <BarChart data={grouped} label={period} />
        </div>
      </div>

      {/* Platform breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Platform Breakdown</h2>
          <p className="text-xs text-gray-400 mt-0.5">Views and earnings by platform</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          {allPlatforms.map((p) => {
            const pct = totalViews > 0 ? Math.round((p.views / totalViews) * 100) : 0
            return (
              <div key={p.platform}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${PLATFORM_COLORS[p.platform] ?? 'bg-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {PLATFORM_LABELS[p.platform] ?? p.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{fmtViews(p.views)} views</span>
                    <span className="font-medium text-gray-900">{fmt(p.earnings)}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${PLATFORM_COLORS[p.platform] ?? 'bg-gray-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% of total views</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
