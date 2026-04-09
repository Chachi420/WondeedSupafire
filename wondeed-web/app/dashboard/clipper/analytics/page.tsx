import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AnalyticsCharts from '@/components/clipper/AnalyticsCharts'

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

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const monthStart    = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [earningsResult, approvedSubsResult, allTimeViewsResult] = await Promise.all([
    db.from('earnings')
      .select('amount_inr, created_at')
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: true }),
    db.from('campaign_submissions')
      .select('capped_view_count, platform, created_at, earnings_inr')
      .eq('clipper_id', user!.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true }),
    db.from('campaign_submissions')
      .select('capped_view_count')
      .eq('clipper_id', user!.id)
      .eq('status', 'approved'),
  ])

  const earnings    = earningsResult.data ?? []
  const approvedSubs = approvedSubsResult.data ?? []

  // Total stats
  const totalViews    = (allTimeViewsResult.data ?? []).reduce((s, x) => s + Number(x.capped_view_count ?? 0), 0)
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.amount_inr), 0)
  const thisMonthEarnings = earnings
    .filter(e => e.created_at >= monthStart)
    .reduce((s, e) => s + Number(e.amount_inr), 0)

  // Build daily earnings map (last 30 days)
  const earningsMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    earningsMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const e of earnings) {
    const day = e.created_at.slice(0, 10)
    if (earningsMap.has(day)) {
      earningsMap.set(day, (earningsMap.get(day) ?? 0) + Number(e.amount_inr))
    }
  }
  const dailyEarnings = Array.from(earningsMap.entries()).map(([date, amount]) => ({ date, amount }))

  // Cumulative views over time (approved subs sorted by date)
  let running = 0
  const cumulativeViews = approvedSubs.map(s => {
    running += Number(s.capped_view_count ?? 0)
    return { date: s.created_at.slice(0, 10), views: running }
  })

  // Platform breakdown
  const platformMap = new Map<string, { views: number; earnings: number }>()
  for (const s of approvedSubs) {
    const p = s.platform as string
    if (!platformMap.has(p)) platformMap.set(p, { views: 0, earnings: 0 })
    const stat = platformMap.get(p)!
    stat.views    += Number(s.capped_view_count ?? 0)
    stat.earnings += Number(s.earnings_inr ?? 0)
  }
  const platformStats = Array.from(platformMap.entries()).map(([platform, stat]) => ({ platform, ...stat }))

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your performance metrics and earnings breakdown</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(totalEarnings)}</p>
          <p className="text-sm text-gray-500 mt-1.5">All-time Earnings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Views Tracked</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-purple-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(thisMonthEarnings)}</p>
          <p className="text-sm text-gray-500 mt-1.5">This Month</p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        dailyEarnings={dailyEarnings}
        cumulativeViews={cumulativeViews}
        platformStats={platformStats}
      />
    </div>
  )
}
