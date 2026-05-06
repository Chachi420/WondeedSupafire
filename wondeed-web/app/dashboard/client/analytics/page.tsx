import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function cpm(spend: number, views: number): string {
  if (views === 0) return '—'
  return fmt((spend / views) * 1000)
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active:           '#22c55e',
    paused:           '#60a5fa',
    completed:        '#9ca3af',
    cancelled:        '#f87171',
    pending_approval: '#fbbf24',
    draft:            '#d1d5db',
  }
  return <span className="badge-dot" style={{ background: colors[status] ?? '#d1d5db' }} />
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [campaignsResult, walletResult] = await Promise.all([
    db.from('campaigns')
      .select(
        'id, title, status, budget_inr, budget_remaining_inr, created_at, ' +
        'campaign_submissions(capped_view_count, status)'
      )
      .eq('client_id', user!.id)
      .not('status', 'in', '("draft")')
      .order('created_at', { ascending: false }),
    db.from('wallets')
      .select('total_debited_inr')
      .eq('user_id', user!.id)
      .single(),
  ])

  const campaigns  = (campaignsResult.data as any[]) ?? []
  const totalSpend = Number((walletResult.data as any)?.total_debited_inr ?? 0)

  const withStats = campaigns.map((c: any) => {
    const subs       = (c.campaign_submissions as any[]) ?? []
    const approved   = subs.filter((s: any) => s.status === 'approved')
    const totalViews = approved.reduce((sum: number, s: any) => sum + (Number(s.capped_view_count) || 0), 0)
    const budgetUsed = Number(c.budget_inr) - Number(c.budget_remaining_inr)
    return { ...c, totalViews, budgetUsed, approvedClips: approved.length, pendingClips: subs.filter((s: any) => s.status === 'pending').length }
  })

  const totalViews     = withStats.reduce((sum, c) => sum + c.totalViews, 0)
  const totalCampaigns = withStats.filter(c => c.status !== 'cancelled').length
  const avgCPM         = totalViews > 0 ? (totalSpend / totalViews) * 1_000 : 0
  const byViews        = [...withStats].sort((a, b) => b.totalViews - a.totalViews)

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Analytics</h1>
          <div className="topbar-sub">Lifetime performance across all your campaigns</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="stat-grid mb-20">
          <div className="stat-card">
            <div className="stat-ico ico-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="stat-label">Total Views Delivered</div>
            <div className="stat-value">{fmtViews(totalViews)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/>
                <path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                <circle cx="17" cy="14" r="1.4" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-label">Total Spend</div>
            <div className="stat-value">{fmt(totalSpend)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
              </svg>
            </div>
            <div className="stat-label">Avg. CPM</div>
            <div className="stat-value">{totalViews > 0 ? fmt(avgCPM) : '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
              </svg>
            </div>
            <div className="stat-label">Campaigns Run</div>
            <div className="stat-value">{totalCampaigns}</div>
          </div>
        </div>

        {byViews.length === 0 ? (
          <div className="card" style={{ padding: '64px 28px', textAlign: 'center' }}>
            <div className="faint mb-8" style={{ fontSize: 13 }}>No campaign data yet</div>
            <div className="faint mb-20" style={{ fontSize: 12 }}>Submit a campaign and get it approved to see analytics</div>
            <Link href="/dashboard/client/create-campaign" className="btn btn-primary">Create Campaign →</Link>
          </div>
        ) : (
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Campaign Performance</h2>
                <div className="sub">Sorted by views delivered</div>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>Spend</th>
                    <th style={{ textAlign: 'right' }}>CPM</th>
                    <th style={{ textAlign: 'right' }}>Clips</th>
                  </tr>
                </thead>
                <tbody>
                  {byViews.map((c: any) => {
                    const maxViews = Math.max(...byViews.map((x: any) => x.totalViews), 1)
                    const barPct   = Math.round((c.totalViews / maxViews) * 100)
                    return (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/dashboard/client/campaigns/${c.id}`} className="med" style={{ color: 'var(--fg)', textDecoration: 'none' }}>
                            {c.title}
                          </Link>
                        </td>
                        <td>
                          <div className="row gap-6">
                            <StatusDot status={c.status} />
                            <span className="muted" style={{ textTransform: 'capitalize' }}>{c.status.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="num bold">{fmtViews(c.totalViews)}</div>
                          {c.totalViews > 0 && (
                            <div className="progress mt-4" style={{ width: 64, height: 3, marginLeft: 'auto' }}>
                              <div className="progress-bar" style={{ width: `${barPct}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="num" style={{ textAlign: 'right' }}>{fmt(c.budgetUsed)}</td>
                        <td className="num" style={{ textAlign: 'right' }}>{cpm(c.budgetUsed, c.totalViews)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="num">{c.approvedClips}</div>
                          {c.pendingClips > 0 && <div className="text-xs" style={{ color: '#d97706' }}>{c.pendingClips} pending</div>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
