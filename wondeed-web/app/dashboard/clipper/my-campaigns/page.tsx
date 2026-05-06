import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import MyCampaignsClient from '@/components/clipper/MyCampaignsClient'
import type { CampaignGroup, SubmissionRow } from '@/components/clipper/MyCampaignsClient'

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

export default async function MyCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string }>
}) {
  const { join: joinId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  let result = await db
    .from('campaign_submissions')
    .select(`
      id, clip_url, platform, status,
      raw_view_count, capped_view_count, earnings_inr, admin_notes,
      created_at, reviewed_at, campaign_id,
      campaigns (
        id, title, platform, target_platforms,
        rate_per_million_inr, budget_remaining_inr,
        per_post_view_cap, status, end_date, source_content_url
      )
    `)
    .eq('clipper_id', user!.id)
    .order('created_at', { ascending: false })

  if (result.error) {
    result = await db
      .from('campaign_submissions')
      .select(`
        id, clip_url, platform, status,
        raw_view_count, capped_view_count, earnings_inr, admin_notes,
        created_at, reviewed_at, campaign_id,
        campaigns (
          id, title, platform,
          rate_per_million_inr, budget_remaining_inr,
          per_post_view_cap, status, end_date
        )
      `)
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: false })
  }

  const { data: rawSubs } = result
  const subs = (rawSubs ?? []) as any[]

  const groupMap = new Map<string, CampaignGroup>()

  for (const s of subs) {
    const cid = s.campaign_id as string
    const c   = s.campaigns as any

    if (!groupMap.has(cid)) {
      groupMap.set(cid, {
        campaign_id:          cid,
        title:                c?.title               ?? 'Unknown Campaign',
        platform:             c?.platform            ?? 'both',
        target_platforms:     c?.target_platforms     ?? [],
        rate_per_million_inr: Number(c?.rate_per_million_inr ?? 0),
        budget_remaining_inr: Number(c?.budget_remaining_inr ?? 0),
        per_post_view_cap:    Number(c?.per_post_view_cap    ?? 0),
        campaign_status:      c?.status              ?? 'unknown',
        end_date:             c?.end_date             ?? null,
        source_content_url:   c?.source_content_url  ?? null,
        total_views:          0,
        total_earnings:       0,
        submissions:          [],
      })
    }

    const g = groupMap.get(cid)!

    const sub: SubmissionRow = {
      id:               s.id,
      clip_url:         s.clip_url,
      platform:         s.platform,
      status:           s.status,
      raw_view_count:   s.raw_view_count   != null ? Number(s.raw_view_count)   : null,
      capped_view_count: s.capped_view_count != null ? Number(s.capped_view_count) : null,
      earnings_inr:     s.earnings_inr     != null ? Number(s.earnings_inr)     : null,
      admin_notes:      s.admin_notes      ?? null,
      created_at:       s.created_at,
      reviewed_at:      s.reviewed_at      ?? null,
    }

    g.total_views    += sub.capped_view_count ?? 0
    g.total_earnings += sub.earnings_inr      ?? 0
    g.submissions.push(sub)
  }

  const groups          = Array.from(groupMap.values())
  const activeGroups    = groups.filter(g => g.campaign_status === 'active')
  const completedGroups = groups.filter(g => g.campaign_status !== 'active')

  const totalViews    = groups.reduce((s, g) => s + g.total_views, 0)
  const totalEarnings = groups.reduce((s, g) => s + g.total_earnings, 0)
  const totalSubs     = subs.length
  const pendingSubs   = subs.filter(s => s.status === 'pending').length

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>My Campaigns</h1>
          <div className="topbar-sub">
            {groups.length} campaign{groups.length !== 1 ? 's' : ''} joined · {totalSubs} clip{totalSubs !== 1 ? 's' : ''} submitted
          </div>
        </div>
      </div>

      <div className="content fade-up">
        {groups.length > 0 && (
          <div className="stat-grid mb-20">
            <div className="stat-card">
              <div className="stat-ico ico-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
                  <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
                </svg>
              </div>
              <div className="stat-label">Total Submissions</div>
              <div className="stat-value">{totalSubs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-ico ico-amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <div className="stat-label">Pending Review</div>
              <div className="stat-value">{pendingSubs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-ico ico-violet">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="stat-label">Total Views</div>
              <div className="stat-value">{fmtViews(totalViews)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-ico ico-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
                </svg>
              </div>
              <div className="stat-label">Total Earned</div>
              <div className="stat-value">{fmt(totalEarnings)}</div>
            </div>
          </div>
        )}

        <MyCampaignsClient
          activeGroups={activeGroups}
          completedGroups={completedGroups}
          initialJoinId={joinId}
        />
      </div>
    </>
  )
}
