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
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default async function ClipperHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const now       = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    profileResult,
    walletResult,
    thisMonthEarningsResult,
    totalViewsResult,
    activeCampaignsResult,
    topPostResult,
    recentSubmissionsResult,
  ] = await Promise.all([
    db.from('profiles').select('full_name, phone, subscription_tier').eq('id', user!.id).single(),
    db.from('wallets').select('balance_inr, total_credited_inr').eq('user_id', user!.id).maybeSingle(),
    db.from('earnings')
      .select('amount_inr')
      .eq('clipper_id', user!.id)
      .gte('created_at', monthStart),
    db.from('campaign_submissions')
      .select('capped_view_count')
      .eq('clipper_id', user!.id)
      .eq('status', 'approved'),
    db.from('campaign_submissions')
      .select('campaign_id')
      .eq('clipper_id', user!.id)
      .in('status', ['pending', 'approved']),
    db.from('campaign_submissions')
      .select('id, clip_url, platform, capped_view_count, earnings_inr, campaigns(title)')
      .eq('clipper_id', user!.id)
      .eq('status', 'approved')
      .order('capped_view_count', { ascending: false })
      .limit(1),
    db.from('campaign_submissions')
      .select('id, clip_url, platform, status, capped_view_count, earnings_inr, created_at, campaigns(title)')
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const profile    = profileResult.data
  const wallet     = walletResult.data
  const displayName = profile?.full_name ?? profile?.phone ?? 'Clipper'

  const thisMonthEarnings = (thisMonthEarningsResult.data ?? [])
    .reduce((sum, e) => sum + Number(e.amount_inr), 0)

  const totalViews = (totalViewsResult.data ?? [])
    .reduce((sum, s) => sum + Number(s.capped_view_count ?? 0), 0)

  const activeCampaignIds = new Set((activeCampaignsResult.data ?? []).map(s => s.campaign_id))
  const activeCampaignsCount = activeCampaignIds.size

  const topPost = (topPostResult.data ?? [])[0] as any ?? null
  const recentSubmissions = (recentSubmissionsResult.data ?? []) as any[]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · Your earnings overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-10">

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(thisMonthEarnings)}</p>
          <p className="text-sm text-gray-500 mt-1.5">This Month's Earnings</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Views Tracked</p>
        </div>

        <Link
          href="/dashboard/clipper/my-campaigns"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-2 h-2 rounded-full bg-purple-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{activeCampaignsCount}</p>
          <p className="text-sm text-gray-500 mt-1.5 group-hover:text-emerald-600 transition-colors">
            Active Campaigns →
          </p>
        </Link>

        <Link
          href="/dashboard/clipper/analytics"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 mb-4" />
          {topPost ? (
            <>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {fmtViews(Number(topPost.capped_view_count ?? 0))}
              </p>
              <p className="text-sm text-gray-500 mt-1.5 group-hover:text-emerald-600 transition-colors truncate">
                Top Post Views →
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">—</p>
              <p className="text-sm text-gray-500 mt-1.5">Top Performing Post</p>
            </>
          )}
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6">

        {/* Top performing post detail */}
        <div className="space-y-6">

          {topPost && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Top Performing Post</span>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">Best</span>
              </div>
              <div className="p-5">
                <p className="text-sm font-medium text-gray-900 mb-1">{topPost.campaigns?.title}</p>
                <a
                  href={topPost.clip_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline truncate block mb-4"
                >
                  {topPost.clip_url}
                </a>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Views</p>
                    <p className="text-xl font-bold text-gray-900">{fmtViews(Number(topPost.capped_view_count ?? 0))}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Earned</p>
                    <p className="text-xl font-bold text-emerald-700">{fmt(Number(topPost.earnings_inr ?? 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/clipper/feed"
                className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center"
              >
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium text-emerald-700">Browse Campaigns</span>
              </Link>
              <Link
                href="/dashboard/clipper/my-campaigns"
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                <span className="text-xs font-medium text-blue-700">Submit a Clip</span>
              </Link>
              <Link
                href="/dashboard/clipper/analytics"
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
              >
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs font-medium text-purple-700">View Analytics</span>
              </Link>
              <Link
                href="/dashboard/clipper/earnings"
                className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-center"
              >
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-amber-700">Request Payout</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent submissions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden self-start">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/dashboard/clipper/my-campaigns" className="text-xs text-emerald-600 hover:underline">
              View all →
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-400">No submissions yet</p>
              <p className="text-xs text-gray-400 mt-1">Browse campaigns and submit your first clip</p>
              <Link
                href="/dashboard/clipper/feed"
                className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Browse Campaigns →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentSubmissions.map((s) => (
                <li key={s.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.campaigns?.title ?? '—'}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 capitalize">
                      {s.platform}
                      {s.capped_view_count != null && (
                        <> · {fmtViews(Number(s.capped_view_count))} views</>
                      )}
                    </p>
                    {s.earnings_inr != null && (
                      <p className="text-xs font-semibold text-emerald-600">{fmt(Number(s.earnings_inr))}</p>
                    )}
                  </div>
                  <a
                    href={s.clip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors truncate"
                  >
                    {s.clip_url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
