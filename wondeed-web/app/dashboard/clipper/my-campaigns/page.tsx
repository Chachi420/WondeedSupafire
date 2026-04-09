import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SubmitUrlForm from '@/components/clipper/SubmitUrlForm'

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    pending:  'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

type Submission = {
  id: string
  clip_url: string
  platform: string
  status: string
  capped_view_count: number | null
  earnings_inr: number | null
  created_at: string
}

type CampaignGroup = {
  campaign_id: string
  title: string
  platform: 'instagram' | 'youtube' | 'both'
  rate_per_million_inr: number
  budget_remaining_inr: number
  campaign_status: string
  total_views: number
  total_earnings: number
  submissions: Submission[]
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

  const [submissionsResult, , joinCampaignResult] = await Promise.all([
    db.from('campaign_submissions')
      .select('id, clip_url, platform, status, capped_view_count, earnings_inr, created_at, campaign_id, campaigns(id, title, platform, rate_per_million_inr, budget_remaining_inr, status)')
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: false }),
    db.from('campaigns')
      .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, status')
      .eq('status', 'active'),
    joinId
      ? db.from('campaigns')
          .select('id, title, platform, rate_per_million_inr, budget_remaining_inr, status')
          .eq('id', joinId)
          .eq('status', 'active')
          .single()
      : Promise.resolve({ data: null }),
  ])

  const rawSubs = (submissionsResult.data ?? []) as any[]

  // Group submissions by campaign
  const groupMap = new Map<string, CampaignGroup>()
  for (const s of rawSubs) {
    const cid = s.campaign_id
    if (!groupMap.has(cid)) {
      const c = s.campaigns as any
      groupMap.set(cid, {
        campaign_id:          cid,
        title:                c?.title ?? 'Unknown Campaign',
        platform:             c?.platform ?? 'both',
        rate_per_million_inr: Number(c?.rate_per_million_inr ?? 0),
        budget_remaining_inr: Number(c?.budget_remaining_inr ?? 0),
        campaign_status:      c?.status ?? 'unknown',
        total_views:          0,
        total_earnings:       0,
        submissions:          [],
      })
    }
    const g = groupMap.get(cid)!
    g.total_views    += Number(s.capped_view_count ?? 0)
    g.total_earnings += Number(s.earnings_inr ?? 0)
    g.submissions.push({
      id:               s.id,
      clip_url:         s.clip_url,
      platform:         s.platform,
      status:           s.status,
      capped_view_count: s.capped_view_count,
      earnings_inr:     s.earnings_inr,
      created_at:       s.created_at,
    })
  }

  const groups = Array.from(groupMap.values())

  // If joinId references a campaign not yet in groups, add it at top
  const joinCampaign = joinCampaignResult.data as any
  const isNewJoin    = joinId && joinCampaign && !groupMap.has(joinId)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {groups.length} campaign{groups.length !== 1 ? 's' : ''} joined · submit clips to earn
        </p>
      </div>

      {/* New join prompt */}
      {isNewJoin && joinCampaign && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Join: {joinCampaign.title}</p>
              <p className="text-xs text-emerald-700 mt-0.5 capitalize">Platform: {joinCampaign.platform}</p>
            </div>
            <span className="shrink-0 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">Active</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-emerald-800 mb-2">Submit your clip URL to join this campaign:</p>
            <SubmitUrlForm
              campaignId={joinCampaign.id}
              campaignPlatform={joinCampaign.platform}
            />
          </div>
        </div>
      )}

      {groups.length === 0 && !isNewJoin ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-gray-500 font-medium">No campaigns joined yet</p>
          <p className="text-sm text-gray-400 mt-1">Browse the campaign feed and submit your first clip</p>
          <a
            href="/dashboard/clipper/feed"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse Campaigns →
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const isActive = group.campaign_status === 'active'

            return (
              <div key={group.campaign_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Campaign header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">{group.title}</h2>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium capitalize ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {group.campaign_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 capitalize">{group.platform}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Views</p>
                      <p className="text-sm font-bold text-gray-900">{fmtViews(group.total_views)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Earned</p>
                      <p className="text-sm font-bold text-emerald-600">{fmt(group.total_earnings)}</p>
                    </div>
                  </div>
                </div>

                {/* Submissions table */}
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">URL</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Platform</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Views</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Earned</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.submissions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3.5 max-w-[200px]">
                          <a
                            href={s.clip_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:underline truncate block"
                          >
                            {s.clip_url}
                          </a>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs capitalize text-gray-600">{s.platform}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-xs text-gray-700 tabular-nums">
                            {s.capped_view_count != null ? fmtViews(Number(s.capped_view_count)) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-xs font-medium tabular-nums ${s.earnings_inr != null ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {s.earnings_inr != null ? fmt(Number(s.earnings_inr)) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-400">
                            {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Submit URL row (only for active campaigns) */}
                {isActive && (
                  <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs font-medium text-gray-600 mb-2">Submit another clip URL:</p>
                    <SubmitUrlForm
                      campaignId={group.campaign_id}
                      campaignPlatform={group.platform}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
