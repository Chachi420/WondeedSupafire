import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { pauseCampaign, resumeCampaign } from '@/app/dashboard/client/actions'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function deadlineLabel(endDate: string | null, durationDays: number | null, createdAt: string): string {
  const refDate = endDate
    ? new Date(endDate)
    : durationDays
      ? new Date(new Date(createdAt).getTime() + durationDays * 86_400_000)
      : null
  if (!refDate) return 'No deadline'
  const diff = Math.ceil((refDate.getTime() - Date.now()) / 86_400_000)
  if (diff < 0)   return 'Expired'
  if (diff === 0) return 'Today'
  return `${diff}d left`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')           return <span className="badge badge-success">active</span>
  if (status === 'pending_approval') return <span className="badge badge-warn">pending approval</span>
  if (status === 'paused')           return <span className="badge badge-info">paused</span>
  if (status === 'cancelled')        return <span className="badge badge-danger">cancelled</span>
  return <span className="badge badge-neutral">{status.replace('_', ' ')}</span>
}

export default async function ClientCampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: campaigns, count } = await db
    .from('campaigns')
    .select(
      'id, title, status, budget_inr, budget_remaining_inr, platform, ' +
      'start_date, end_date, duration_days, created_at, ' +
      'campaign_submissions(capped_view_count, status)',
      { count: 'exact' }
    )
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>My Campaigns</h1>
          <div className="topbar-sub">{count ?? 0} total campaigns</div>
        </div>
        <div className="topbar-right">
          <Link href="/dashboard/client/create-campaign" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M12 4v16m8-8H4"/>
            </svg>
            New Campaign
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        {!(campaigns as any[])?.length ? (
          <div className="card" style={{ padding: '64px 28px', textAlign: 'center' }}>
            <div className="faint mb-8" style={{ fontSize: 13 }}>No campaigns yet</div>
            <div className="faint mb-20" style={{ fontSize: 12 }}>Create your first campaign and start getting views</div>
            <Link href="/dashboard/client/create-campaign" className="btn btn-primary">
              Create Campaign →
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Views Delivered</th>
                    <th style={{ textAlign: 'right' }}>Budget Remaining</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaigns as any[]).map((c) => {
                    const submissions = (c.campaign_submissions as any[]) ?? []
                    const totalViews  = submissions
                      .filter((s: any) => s.status === 'approved')
                      .reduce((sum: number, s: any) => sum + (Number(s.capped_view_count) || 0), 0)
                    const usedPct     = c.budget_inr > 0
                      ? Math.min(100, Math.round(((Number(c.budget_inr) - Number(c.budget_remaining_inr)) / Number(c.budget_inr)) * 100))
                      : 0
                    const deadline    = deadlineLabel(c.end_date, c.duration_days, c.created_at)
                    const dlDanger    = deadline === 'Expired' || deadline === 'Today' || (parseInt(deadline) <= 3 && deadline.includes('d'))

                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="col">
                            <Link href={`/dashboard/client/campaigns/${c.id}`} className="med" style={{ color: 'var(--fg)', textDecoration: 'none' }}>
                              {c.title}
                            </Link>
                            <div className="text-xs faint mt-4" style={{ textTransform: 'capitalize' }}>{c.platform}</div>
                          </div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="num bold">{fmtViews(totalViews)}</div>
                          <div className="text-xs faint">{submissions.filter((s: any) => s.status === 'approved').length} clips</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="num">{fmt(Number(c.budget_remaining_inr))}</div>
                          <div className="progress mt-4" style={{ width: 64, height: 3, marginLeft: 'auto' }}>
                            <div className="progress-bar" style={{ width: `${100 - usedPct}%` }} />
                          </div>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: dlDanger ? 'var(--danger)' : 'var(--fg-muted)' }}>
                            {deadline}
                          </span>
                          {c.end_date && <div className="text-xs faint">{c.end_date}</div>}
                        </td>
                        <td>
                          {c.status === 'active' && (
                            <form action={pauseCampaign.bind(null, c.id)}>
                              <button type="submit" className="btn btn-secondary btn-sm">Pause</button>
                            </form>
                          )}
                          {c.status === 'paused' && (
                            <form action={resumeCampaign.bind(null, c.id)}>
                              <button type="submit" className="btn btn-secondary btn-sm" style={{ color: 'var(--success)' }}>Resume</button>
                            </form>
                          )}
                          {!['active', 'paused'].includes(c.status) && (
                            <span className="faint">—</span>
                          )}
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
