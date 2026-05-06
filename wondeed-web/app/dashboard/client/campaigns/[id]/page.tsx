import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { submitForApproval, cancelCampaign } from '@/app/dashboard/client/actions'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number | null) {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')           return <span className="badge badge-success">active</span>
  if (status === 'pending_approval') return <span className="badge badge-warn">pending approval</span>
  if (status === 'approved')         return <span className="badge badge-success">approved</span>
  if (status === 'rejected')         return <span className="badge badge-danger">rejected</span>
  if (status === 'pending')          return <span className="badge badge-info">pending</span>
  if (status === 'cancelled')        return <span className="badge badge-danger">cancelled</span>
  return <span className="badge badge-neutral">{status.replace('_', ' ')}</span>
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: campaign } = await db
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .eq('client_id', user!.id)
    .single()

  if (!campaign) notFound()

  const { data: submissions } = await db
    .from('campaign_submissions')
    .select('id, clip_url, platform, status, raw_view_count, capped_view_count, earnings_inr, admin_notes, created_at, reviewed_at, profiles(full_name, phone)')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })

  const approved   = submissions?.filter(s => s.status === 'approved') ?? []
  const totalViews = approved.reduce((sum, s) => sum + (Number(s.capped_view_count) || 0), 0)
  const totalEarned= approved.reduce((sum, s) => sum + (Number(s.earnings_inr) || 0), 0)
  const budgetUsed = Number(campaign.budget_inr) - Number(campaign.budget_remaining_inr)
  const usedPct    = campaign.budget_inr > 0
    ? Math.min(100, Math.round((budgetUsed / Number(campaign.budget_inr)) * 100))
    : 0

  const canSubmit = campaign.status === 'draft'
  const canCancel = ['draft', 'pending_approval'].includes(campaign.status)

  return (
    <>
      <div className="topbar">
        <div className="col">
          <div className="row gap-8 mb-4">
            <Link href="/dashboard/client/campaigns" className="text-xs faint" style={{ textDecoration: 'none' }}>← All campaigns</Link>
          </div>
          <div className="row gap-12">
            <h1>{campaign.title}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          {campaign.description && (
            <div className="topbar-sub">{campaign.description}</div>
          )}
        </div>
        <div className="topbar-right">
          {canSubmit && (
            <form action={submitForApproval.bind(null, campaign.id)}>
              <button type="submit" className="btn btn-primary">Submit for Approval →</button>
            </form>
          )}
          {campaign.status === 'pending_approval' && (
            <span className="badge badge-warn" style={{ padding: '8px 14px' }}>Awaiting admin review</span>
          )}
          {canCancel && (
            <form action={cancelCampaign.bind(null, campaign.id)}>
              <button type="submit" className="btn btn-secondary">Cancel</button>
            </form>
          )}
        </div>
      </div>

      <div className="content fade-up">
        {/* Stats */}
        <div className="stat-grid mb-20">
          <div className="stat-card">
            <div className="stat-ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/>
                <path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                <circle cx="17" cy="14" r="1.4" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-label">Clipper Budget</div>
            <div className="stat-value">{fmt(Number(campaign.budget_inr))}</div>
            <div className="stat-delta flat" style={{ fontSize: 11 }}>+20% fee → {fmt(Number(campaign.total_charged_inr))} total</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
              </svg>
            </div>
            <div className="stat-label">Budget Used</div>
            <div className="stat-value">{fmt(budgetUsed)}</div>
            <div style={{ marginTop: 6 }}>
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar" style={{ width: `${usedPct}%` }} />
              </div>
              <div className="stat-delta flat" style={{ fontSize: 11, marginTop: 4 }}>{usedPct}% · {fmt(Number(campaign.budget_remaining_inr))} left</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div className="stat-label">Total Views</div>
            <div className="stat-value">{fmtViews(totalViews)}</div>
            <div className="stat-delta flat" style={{ fontSize: 11 }}>{approved.length} approved clip{approved.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
                <circle cx="17" cy="6" r="2.5"/><path d="M16 13c3 0 6 2 6 5"/>
              </svg>
            </div>
            <div className="stat-label">Paid to Clippers</div>
            <div className="stat-value">{fmt(totalEarned)}</div>
            <div className="stat-delta flat" style={{ fontSize: 11 }}>cap: {fmtViews(Number(campaign.per_post_view_cap))} views/post</div>
          </div>
        </div>

        {/* Campaign meta */}
        <div className="card mb-20">
          <div style={{ padding: '14px 24px' }} className="row gap-24 flex-wrap">
            {[
              ['Platform',  campaign.platform, true],
              ['CPM Rate',  Number(campaign.rate_per_million_inr) > 0 ? `₹${Number(campaign.rate_per_million_inr).toLocaleString('en-IN')} / 1M views` : 'Set by Wondeed on approval', false],
              ['Start',     campaign.start_date ?? '—', false],
              ['End',       campaign.end_date ?? 'Until budget exhausted', false],
            ].map(([label, value, cap]) => (
              <div key={label as string} className="col gap-4">
                <span className="text-xs faint">{label}</span>
                <span className="med text-xs" style={{ textTransform: cap ? 'capitalize' : undefined }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Clip Submissions</h2>
              <div className="sub">{submissions?.length ?? 0} total</div>
            </div>
          </div>

          {!submissions?.length ? (
            <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>
              {campaign.status === 'active'
                ? 'No clips submitted yet — clippers will see this campaign and submit soon'
                : 'Clips will appear here once the campaign is active'}
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Clipper</th>
                    <th>Clip</th>
                    <th>Platform</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th style={{ textAlign: 'right' }}>Earned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <div className="med">{s.profiles?.full_name ?? s.profiles?.phone ?? 'Unknown'}</div>
                        <div className="text-xs faint">{new Date(s.created_at).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td>
                        <a
                          href={s.clip_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs mono"
                          style={{ color: 'var(--primary)', textDecoration: 'none', display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={s.clip_url}
                        >
                          {s.clip_url.replace(/^https?:\/\//, '').substring(0, 30)}…
                        </a>
                      </td>
                      <td className="muted" style={{ textTransform: 'capitalize' }}>{s.platform}</td>
                      <td className="num" style={{ textAlign: 'right' }}>
                        {fmtViews(s.capped_view_count)}
                        {s.raw_view_count !== s.capped_view_count && s.raw_view_count && (
                          <span className="text-xs faint ml-4">(raw: {fmtViews(s.raw_view_count)})</span>
                        )}
                      </td>
                      <td className="num bold" style={{ textAlign: 'right' }}>
                        {s.earnings_inr != null ? fmt(Number(s.earnings_inr)) : '—'}
                      </td>
                      <td>
                        <StatusBadge status={s.status} />
                        {s.admin_notes && (
                          <div className="text-xs faint mt-4 italic" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.admin_notes}>
                            {s.admin_notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
