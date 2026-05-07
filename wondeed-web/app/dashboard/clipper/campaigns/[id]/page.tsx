import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { NICHES } from '@/components/client/CampaignForm'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function daysLeft(endDate: string | null): number | null {
  if (!endDate) return null
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000)
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [campaignResult, submissionsResult] = await Promise.all([
    (db.from('campaigns') as any)
      .select(
        'id, title, description, platform, target_platforms, ' +
        'budget_inr, budget_remaining_inr, rate_per_million_inr, per_post_view_cap, ' +
        'end_date, min_clipper_tier, clip_aspect_ratio, clip_length_seconds, ' +
        'clip_language, hook_style, min_views_for_payout, source_content_url, niche, status, created_at'
      )
      .eq('id', id)
      .eq('status', 'active')
      .single(),
    db.from('campaign_submissions')
      .select('id, clip_url, platform, status, raw_view_count, capped_view_count, earnings_inr, admin_notes, created_at, reviewed_at')
      .eq('clipper_id', user!.id)
      .eq('campaign_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (campaignResult.error || !campaignResult.data) {
    notFound()
  }

  const campaign = campaignResult.data as {
    id: string; title: string; description: string | null
    platform: string; target_platforms: string[]
    budget_inr: number; budget_remaining_inr: number
    rate_per_million_inr: number; per_post_view_cap: number
    end_date: string | null; min_clipper_tier: string
    clip_aspect_ratio: string | null; clip_length_seconds: number | null
    clip_language: string | null; hook_style: string | null
    min_views_for_payout: number | null; source_content_url: string | null
    niche: string | null; status: string; created_at: string
  }

  const submissions = (submissionsResult.data ?? []) as {
    id: string; clip_url: string; platform: string; status: string
    raw_view_count: number | null; capped_view_count: number | null
    earnings_inr: number | null; admin_notes: string | null
    created_at: string; reviewed_at: string | null
  }[]

  const nicheLabel = campaign.niche
    ? (NICHES.find(n => n.value === campaign.niche)?.label ?? campaign.niche)
    : null

  const platforms: string[] = (campaign.target_platforms as string[])?.length
    ? (campaign.target_platforms as string[])
    : campaign.platform === 'both' ? ['instagram', 'youtube'] : [campaign.platform]

  const dl = daysLeft(campaign.end_date)
  const budgetPct = campaign.budget_inr > 0
    ? Math.min(100, Math.round((Number(campaign.budget_remaining_inr) / Number(campaign.budget_inr)) * 100))
    : 0

  const totalMyViews = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + Number(s.capped_view_count ?? 0), 0)
  const totalMyEarnings = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + Number(s.earnings_inr ?? 0), 0)

  return (
    <>
      <div className="topbar">
        <div className="col">
          <div className="row gap-8 mb-4">
            <Link href="/dashboard/clipper/feed" className="text-xs faint" style={{ textDecoration: 'none' }}>← Campaign Feed</Link>
          </div>
          <div className="row gap-10">
            <h1>{campaign.title}</h1>
            <span className="badge badge-success">Active</span>
            {nicheLabel && <span className="badge badge-neutral">{nicheLabel}</span>}
          </div>
          {campaign.description && <div className="topbar-sub">{campaign.description}</div>}
        </div>
        <div className="topbar-right">
          <Link href={`/dashboard/clipper/submit?campaign=${campaign.id}`} className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Submit Clips
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>

          {/* Left column */}
          <div className="col gap-16">

            {/* Key stats */}
            <div className="g2">
              <div className="stat-card">
                <div className="stat-ico ico-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
                  </svg>
                </div>
                <div className="stat-label">CPM Rate</div>
                <div className="stat-value" style={{ fontSize: 20 }}>
                  {Number(campaign.rate_per_million_inr) > 0
                    ? `₹${Math.round(Number(campaign.rate_per_million_inr) / 1000)} / 1K`
                    : 'TBD'}
                </div>
                <div className="stat-delta flat" style={{ fontSize: 11 }}>
                  {Number(campaign.rate_per_million_inr) > 0
                    ? `₹${Number(campaign.rate_per_million_inr).toLocaleString('en-IN')} per million`
                    : 'Rate set by Wondeed'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-ico ico-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="stat-label">Max Views / Post</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{fmtViews(Number(campaign.per_post_view_cap))}</div>
                <div className="stat-delta flat" style={{ fontSize: 11 }}>
                  {Number(campaign.rate_per_million_inr) > 0
                    ? `Max ≈ ${fmt(Math.round(Number(campaign.per_post_view_cap) / 1_000_000 * Number(campaign.rate_per_million_inr)))} per post`
                    : 'Max earnings after CPM is set'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-ico ico-violet">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/>
                    <path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                    <circle cx="17" cy="14" r="1.4" fill="currentColor"/>
                  </svg>
                </div>
                <div className="stat-label">Budget Remaining</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{fmt(Number(campaign.budget_remaining_inr))}</div>
                <div style={{ marginTop: 6 }}>
                  <div className="progress" style={{ height: 3 }}>
                    <div className="progress-bar" style={{ width: `${budgetPct}%`, background: budgetPct < 20 ? 'var(--danger)' : budgetPct < 50 ? '#d97706' : undefined }} />
                  </div>
                  <div className="stat-delta flat" style={{ fontSize: 11, marginTop: 4 }}>{budgetPct}% remaining</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-ico ico-amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>
                  </svg>
                </div>
                <div className="stat-label">Time Left</div>
                <div className="stat-value" style={{ fontSize: 20, color: dl !== null && dl <= 3 ? 'var(--danger)' : dl !== null && dl <= 7 ? '#d97706' : undefined }}>
                  {dl !== null ? (dl <= 0 ? 'Ending today' : `${dl}d`) : 'No deadline'}
                </div>
                {campaign.end_date && dl !== null && (
                  <div className="stat-delta flat" style={{ fontSize: 11 }}>
                    Ends {new Date(campaign.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <div className="card-head">
                <h2>Campaign Requirements</h2>
              </div>
              <div className="g2" style={{ padding: '16px 24px', gap: 8 }}>
                {[
                  campaign.clip_aspect_ratio   && ['Aspect Ratio',        campaign.clip_aspect_ratio,   false],
                  campaign.clip_length_seconds && ['Clip Length',          `${campaign.clip_length_seconds}s`, false],
                  campaign.clip_language       && ['Language',             campaign.clip_language,        true ],
                  campaign.hook_style          && ['Hook Style',           campaign.hook_style,           true ],
                  (campaign.min_views_for_payout ?? 0) > 0 && ['Min Views for Payout', fmtViews(campaign.min_views_for_payout!), false],
                  ['Required Tier',   campaign.min_clipper_tier,                                         true ],
                  ['Platforms',       platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', '), false],
                ].filter(Boolean).map(([label, value, cap]: any) => (
                  <div key={label} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs faint">{label}</span>
                    <span className="text-xs med" style={{ textTransform: cap ? 'capitalize' : undefined }}>{value}</span>
                  </div>
                ))}
              </div>
              {campaign.source_content_url && (
                <div style={{ padding: '0 24px 16px' }}>
                  <div className="text-xs faint mb-4">Source Content to Clip</div>
                  <a href={campaign.source_content_url} target="_blank" rel="noopener noreferrer" className="text-xs mono" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {campaign.source_content_url}
                  </a>
                </div>
              )}
            </div>

            {/* Earnings formula */}
            <div className="helper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
              <div>
                <div className="bold text-xs">How earnings are calculated</div>
                <div className="mt-4 text-xs">
                  {Number(campaign.rate_per_million_inr) > 0
                    ? `Views × ₹${Number(campaign.rate_per_million_inr).toLocaleString('en-IN')} ÷ 1,000,000 = earnings.`
                    : 'Earnings = Views × CPM rate ÷ 1,000,000. CPM rate is set by Wondeed.'}
                  {' '}Views are capped at {fmtViews(Number(campaign.per_post_view_cap))} per post.
                  {(campaign.min_views_for_payout ?? 0) > 0 && ` Your clip must reach ${fmtViews(campaign.min_views_for_payout!)} views to qualify.`}
                </div>
              </div>
            </div>

            {/* My submissions */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h2>My Submissions</h2>
                  <div className="sub">{submissions.length} clip{submissions.length !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {submissions.length === 0 ? (
                <div style={{ padding: '48px 28px', textAlign: 'center' }} className="col gap-8 items-center">
                  <div className="faint" style={{ fontSize: 13 }}>No clips submitted yet</div>
                  <Link href="/dashboard/clipper/submit" className="btn btn-primary">Submit Clips →</Link>
                </div>
              ) : (
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Post URL</th>
                        <th>Platform</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Views</th>
                        <th style={{ textAlign: 'right' }}>Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => {
                        const isCapped = s.status === 'approved'
                          && s.raw_view_count != null && s.capped_view_count != null
                          && s.raw_view_count > s.capped_view_count
                        return (
                          <tr key={s.id}>
                            <td style={{ maxWidth: 180 }}>
                              <a href={s.clip_url} target="_blank" rel="noopener noreferrer" className="text-xs mono" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.clip_url}
                              </a>
                            </td>
                            <td className="muted" style={{ textTransform: 'capitalize' }}>{s.platform}</td>
                            <td className="muted">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td>
                              {s.status === 'approved'  ? <span className="badge badge-success">Approved</span>
                                : s.status === 'rejected' ? <span className="badge badge-danger">Rejected</span>
                                : <span className="badge badge-warn">Pending</span>}
                              {s.admin_notes && <div className="text-xs faint mt-4 italic" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.admin_notes}</div>}
                            </td>
                            <td className="num" style={{ textAlign: 'right' }}>
                              {s.capped_view_count != null
                                ? <>{fmtViews(Number(s.capped_view_count))}{isCapped && <div className="text-xs faint" style={{ textDecoration: 'line-through' }}>{fmtViews(Number(s.raw_view_count))}</div>}</>
                                : <span className="faint">—</span>}
                            </td>
                            <td className="num bold" style={{ textAlign: 'right', color: s.earnings_inr != null && Number(s.earnings_inr) > 0 ? 'var(--primary)' : undefined }}>
                              {s.earnings_inr != null && Number(s.earnings_inr) > 0 ? fmt(Number(s.earnings_inr)) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col gap-16">

            {/* My stats */}
            <div className="wallet-hero" style={{ padding: '20px' }}>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
                My Campaign Stats
              </div>
              <div className="col gap-16">
                {[
                  ['Clips submitted', submissions.length],
                  ['Total views', fmtViews(totalMyViews)],
                  ['Total earned', fmt(totalMyEarnings)],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit CTA */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ marginBottom: 6, fontSize: 14 }}>Ready to earn?</h2>
              <div className="sub mb-12">Submit up to 10 clips at once. Views are fetched automatically.</div>
              <Link href={`/dashboard/clipper/submit?campaign=${campaign.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Submit Clips →
              </Link>
            </div>

            {/* Campaign started */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <div className="text-xs faint mb-4">Campaign started</div>
              <div className="text-xs med">
                {new Date(campaign.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
