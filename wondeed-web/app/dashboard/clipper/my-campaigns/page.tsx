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

  // Try with migration-002 columns; fall back to base schema if they don't exist yet
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

  // ── Group by campaign ──────────────────────────────────────────
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
        rate_per_million_inr: Number(c?.rate_per_million_inr ?? 10_000),
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

  const groups = Array.from(groupMap.values())

  // ── Split active vs completed/other ───────────────────────────
  const activeGroups    = groups.filter(g => g.campaign_status === 'active')
  const completedGroups = groups.filter(g => g.campaign_status !== 'active')

  // ── Summary stats ─────────────────────────────────────────────
  const totalViews    = groups.reduce((s, g) => s + g.total_views, 0)
  const totalEarnings = groups.reduce((s, g) => s + g.total_earnings, 0)
  const totalSubs     = subs.length
  const approvedSubs  = subs.filter(s => s.status === 'approved').length
  const pendingSubs   = subs.filter(s => s.status === 'pending').length

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {groups.length} campaign{groups.length !== 1 ? 's' : ''} joined · {totalSubs} clip{totalSubs !== 1 ? 's' : ''} submitted
        </p>
      </div>

      {/* Summary cards */}
      {groups.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="w-2 h-2 rounded-full bg-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalSubs}</p>
            <p className="text-xs text-gray-500 mt-1">Total Submissions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mb-3" />
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{pendingSubs}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {fmtViews(totalViews)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Views</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="w-2 h-2 rounded-full bg-green-600 mb-3" />
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">
              {fmt(totalEarnings)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Earned</p>
          </div>
        </div>
      )}

      <MyCampaignsClient
        activeGroups={activeGroups}
        completedGroups={completedGroups}
        initialJoinId={joinId}
      />
    </div>
  )
}
