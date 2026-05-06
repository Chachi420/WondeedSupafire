import { createAdminClient } from '@/lib/supabase/admin'
import SubmissionQueue from '@/components/admin/SubmissionQueue'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
  const db = createAdminClient()

  // Use !clipper_id hint to disambiguate — campaign_submissions has two FKs to profiles
  // (clipper_id and reviewed_by). Without the hint PostgREST errors and returns nothing.
  const { data: pending, error: pendingErr } = await db
    .from('campaign_submissions')
    .select(`
      id, clip_url, platform, status, created_at,
      campaigns ( title, rate_per_million_inr, per_post_view_cap, budget_remaining_inr ),
      profiles!clipper_id ( full_name, phone )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: reviewed } = await db
    .from('campaign_submissions')
    .select(`
      id, clip_url, platform, status, raw_view_count, capped_view_count,
      earnings_inr, admin_notes, reviewed_at,
      campaigns ( title ),
      profiles!clipper_id ( full_name, phone )
    `)
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false })
    .limit(30)

  const fmtNum = (n: number | null) => n != null ? new Intl.NumberFormat('en-IN').format(n) : '—'
  const fmtInr = (n: number | null) => n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : '—'

  return (
    <>
      <div className="topbar">
        <div className="col">
          <div className="row gap-12">
            <h1>Submission Review</h1>
            {(pending?.length ?? 0) > 0 && (
              <span className="badge badge-warn" style={{ padding: '4px 10px', fontSize: 12 }}>
                <span className="badge-dot" style={{ background: '#d97706' }} />
                {pending!.length} Pending
              </span>
            )}
          </div>
          <div className="topbar-sub">Verify view counts and approve clipper payouts. SLA: 24h.</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export queue
          </button>
        </div>
      </div>

      <div className="content fade-up">
        {pendingErr && (
          <div className="helper mb-20" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca', color: 'var(--danger)' }}>
            Query error: {pendingErr.message}
          </div>
        )}

        <div className="card mb-20">
          <div className="card-head">
            <div>
              <h2>Pending Queue</h2>
              <div className="sub">Click a row to review and enter view counts</div>
            </div>
          </div>
          <SubmissionQueue submissions={(pending ?? []) as any} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Recently Reviewed</h2>
              <div className="sub">Last 30 approved / rejected submissions</div>
            </div>
          </div>
          {!reviewed?.length ? (
            <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>No reviewed submissions yet</div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign / Clipper</th>
                    <th>Platform</th>
                    <th style={{ textAlign: 'right' }}>Views (raw / capped)</th>
                    <th style={{ textAlign: 'right' }}>Earned</th>
                    <th>Status</th>
                    <th>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewed.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <div className="col">
                          <div className="med">{(s.campaigns as any)?.title ?? '—'}</div>
                          <div className="text-xs faint mt-4">{(s.profiles as any)?.full_name ?? (s.profiles as any)?.phone ?? '—'}</div>
                        </div>
                      </td>
                      <td className="muted" style={{ textTransform: 'capitalize' }}>{s.platform}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtNum(s.raw_view_count)} / {fmtNum(s.capped_view_count)}</td>
                      <td className="num bold" style={{ textAlign: 'right' }}>{fmtInr(s.earnings_inr)}</td>
                      <td>
                        {s.status === 'approved'
                          ? <span className="badge badge-success">Approved</span>
                          : <span className="badge badge-danger">Rejected</span>}
                        {s.admin_notes && <div className="text-xs faint mt-4 italic">{s.admin_notes}</div>}
                      </td>
                      <td className="muted">{s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString('en-IN') : '—'}</td>
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
