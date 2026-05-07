import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import AnalyticsCharts from '@/components/clipper/AnalyticsCharts'
import { fmtRupee as fmt, fmtViews } from '@/lib/format'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

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

  const earnings     = earningsResult.data ?? []
  const approvedSubs = approvedSubsResult.data ?? []

  const totalViews    = (allTimeViewsResult.data ?? []).reduce((s, x) => s + Number(x.capped_view_count ?? 0), 0)
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.amount_inr), 0)
  const thisMonthEarnings = earnings
    .filter(e => e.created_at >= monthStart)
    .reduce((s, e) => s + Number(e.amount_inr), 0)

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

  let running = 0
  const cumulativeViews = approvedSubs.map(s => {
    running += Number(s.capped_view_count ?? 0)
    return { date: s.created_at.slice(0, 10), views: running }
  })

  const platformMap = new Map<string, { views: number; earnings: number }>()
  for (const s of approvedSubs) {
    const p = s.platform as string
    if (!platformMap.has(p)) platformMap.set(p, { views: 0, earnings: 0 })
    const stat = platformMap.get(p)!
    stat.views    += Number(s.capped_view_count ?? 0)
    stat.earnings += Number(s.earnings_inr ?? 0)
  }
  const platformStats = Array.from(platformMap.entries()).map(([platform, stat]) => ({ platform, ...stat }))

  const hasData = totalViews > 0 || totalEarnings > 0

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Analytics</h1>
          <div className="topbar-sub">Your performance metrics and earnings breakdown</div>
        </div>
      </div>

      {!hasData && (
        <div className="content fade-up">
          <div className="card" style={{ padding: '64px 28px', textAlign: 'center', borderStyle: 'dashed' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32, color: 'var(--fg-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h1v11H4zm6 0h1v11h-1zm5 0h1v11h-1zm5 0h1v11h-1z" />
              </svg>
            </div>
            <p className="med" style={{ marginBottom: 8 }}>No data yet</p>
            <p className="text-xs faint" style={{ marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
              Submit clips to campaigns and get them approved — your views and earnings will appear here once verified.
            </p>
            <div className="row gap-12 justify-center">
              <Link href="/dashboard/clipper/feed" className="btn btn-primary">Browse Campaigns →</Link>
              <Link href="/dashboard/clipper/submit" className="btn btn-secondary">Submit a Clip</Link>
            </div>
          </div>
        </div>
      )}

      {hasData && <div className="content fade-up">
        <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-ico ico-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
              </svg>
            </div>
            <div className="stat-label">All-time Earnings</div>
            <div className="stat-value">{fmt(totalEarnings)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="stat-label">Total Views Tracked</div>
            <div className="stat-value">{fmtViews(totalViews)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="stat-label">This Month</div>
            <div className="stat-value">{fmt(thisMonthEarnings)}</div>
          </div>
        </div>

        <AnalyticsCharts
          dailyEarnings={dailyEarnings}
          cumulativeViews={cumulativeViews}
          platformStats={platformStats}
        />
      </div>}
    </>
  )
}
