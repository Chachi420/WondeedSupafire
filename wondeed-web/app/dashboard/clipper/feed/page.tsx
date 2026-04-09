import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}

function deadlineLabel(endDate: string | null): string {
  if (!endDate) return 'No deadline'
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return 'Expired'
  if (diff === 0) return 'Ends today'
  if (diff === 1) return '1 day left'
  if (diff <= 7)  return `${diff} days left`
  if (diff <= 30) return `${Math.ceil(diff / 7)} weeks left`
  return `${Math.ceil(diff / 30)} months left`
}

function deadlineColor(endDate: string | null): string {
  if (!endDate) return 'text-gray-400'
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000)
  if (diff <= 3)  return 'text-red-600'
  if (diff <= 7)  return 'text-amber-600'
  return 'text-gray-500'
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    pro:        'bg-gray-100 text-gray-700',
    premium:    'bg-blue-100 text-blue-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[tier] ?? 'bg-gray-100 text-gray-600'}`}>
      {tier}+
    </span>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    instagram: 'bg-pink-100 text-pink-800',
    youtube:   'bg-red-100 text-red-800',
    both:      'bg-purple-100 text-purple-800',
  }
  const labels: Record<string, string> = {
    instagram: 'Instagram',
    youtube:   'YouTube',
    both:      'All Platforms',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[platform] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[platform] ?? platform}
    </span>
  )
}

function contentTypeLabel(campaign: any): string {
  const parts: string[] = []
  if (campaign.clip_aspect_ratio) parts.push(campaign.clip_aspect_ratio)
  if (campaign.clip_length_seconds) parts.push(`${campaign.clip_length_seconds}s`)
  if (campaign.clip_language) parts.push(campaign.clip_language)
  return parts.join(' · ') || 'Short-form video'
}

export default async function CampaignFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [campaignsResult, mySubmissionsResult] = await Promise.all([
    db.from('campaigns')
      .select('id, title, description, platform, budget_remaining_inr, rate_per_million_inr, per_post_view_cap, end_date, min_clipper_tier, clip_aspect_ratio, clip_length_seconds, clip_language, hook_style, min_views_for_payout, created_at, client_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    db.from('campaign_submissions')
      .select('campaign_id')
      .eq('clipper_id', user!.id),
  ])

  const campaigns   = (campaignsResult.data ?? []) as any[]
  const joinedIds   = new Set((mySubmissionsResult.data ?? []).map(s => s.campaign_id))

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {campaigns.length} live campaign{campaigns.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 font-medium">No live campaigns right now</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon — new campaigns are added regularly</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {campaigns.map((c) => {
            const isJoined   = joinedIds.has(c.id)
            const deadline   = deadlineLabel(c.end_date)
            const dlColor    = deadlineColor(c.end_date)
            const budgetPct  = Math.min(100, Math.round(
              (Number(c.budget_remaining_inr) / (Number(c.budget_remaining_inr) + 1)) * 100
            ))

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">

                {/* Card header */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{c.title}</h3>
                    {isJoined && (
                      <span className="shrink-0 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">Joined</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PlatformBadge platform={c.platform} />
                    <TierBadge tier={c.min_clipper_tier} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-4 space-y-3">

                  {/* Content type */}
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Content Type</p>
                      <p className="text-xs font-medium text-gray-900">{contentTypeLabel(c)}</p>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Rate</p>
                      <p className="text-xs font-medium text-gray-900">
                        {fmt(Number(c.rate_per_million_inr))} / 1M views
                        {c.per_post_view_cap > 0 && (
                          <span className="text-gray-400"> · cap {fmtViews(c.per_post_view_cap)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Budget remaining */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500">Budget Remaining</p>
                      <p className="text-xs font-semibold text-gray-900">{fmt(Number(c.budget_remaining_inr))}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (Number(c.budget_remaining_inr) / 100000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-xs font-medium ${dlColor}`}>{deadline}</span>
                  </div>

                  {/* Min payout threshold */}
                  {c.min_views_for_payout != null && c.min_views_for_payout > 0 && (
                    <p className="text-xs text-gray-400">
                      Min {fmtViews(c.min_views_for_payout)} views for payout
                    </p>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="px-5 py-4 border-t border-gray-100">
                  {isJoined ? (
                    <Link
                      href="/dashboard/clipper/my-campaigns"
                      className="block w-full py-2 text-center text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      View My Submissions
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/clipper/my-campaigns?join=${c.id}`}
                      className="block w-full py-2 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      Join Campaign →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
