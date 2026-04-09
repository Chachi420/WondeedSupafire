import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { TIER_CONFIG, nextTier } from '@/lib/tiers'
import type { SubscriptionTier } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-500',
  pending_approval: 'bg-amber-100 text-amber-800',
  active:           'bg-green-100 text-green-800',
  paused:           'bg-blue-100 text-blue-700',
  completed:        'bg-gray-100 text-gray-600',
  cancelled:        'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function pct(used: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
}

export default async function ClientOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  const [profile, wallet, campaigns, monthCount, allCampaignIds] = await Promise.all([
    db.from('profiles').select('full_name, phone, subscription_tier').eq('id', user!.id).single(),
    db.from('wallets').select('balance_inr, total_credited_inr, total_debited_inr').eq('user_id', user!.id).single(),
    db.from('campaigns')
      .select('id, title, status, budget_inr, budget_remaining_inr, platform, created_at')
      .eq('client_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user!.id)
      .gte('created_at', startOfMonth.toISOString())
      .neq('status', 'cancelled'),
    db.from('campaigns').select('id').eq('client_id', user!.id),
  ])

  // Sequential: total views lifetime
  const ids = allCampaignIds.data?.map((c: any) => c.id) ?? []
  const viewsData = ids.length > 0
    ? await db.from('campaign_submissions')
        .select('capped_view_count')
        .in('campaign_id', ids)
        .eq('status', 'approved')
    : { data: [] }
  const totalViewsLifetime = (viewsData.data ?? []).reduce(
    (sum: number, s: any) => sum + (Number(s.capped_view_count) || 0), 0
  )

  const tier        = (((profile.data as any)?.subscription_tier) ?? 'pro') as SubscriptionTier
  const tierConfig  = TIER_CONFIG[tier]
  const upgrade     = nextTier(tier)
  const usedThisMonth  = monthCount.count ?? 0
  const campaignLimit  = isFinite(tierConfig.campaign_limit) ? tierConfig.campaign_limit : null
  const usagePct       = campaignLimit ? pct(usedThisMonth, campaignLimit) : 0

  const cData            = (campaigns.data as any[]) ?? []
  const activeCampaigns  = cData.filter(c => c.status === 'active').length
  const pendingCampaigns = cData.filter(c => c.status === 'pending_approval').length
  const totalSpend       = Number((wallet.data as any)?.total_debited_inr ?? 0)
  const walletBalance    = Number((wallet.data as any)?.balance_inr ?? 0)
  const totalCredited    = Number((wallet.data as any)?.total_credited_inr ?? 0)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {(profile.data as any)?.full_name ?? (profile.data as any)?.phone ?? 'Client'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your campaign performance at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-6">

        {/* Wallet */}
        <div className="bg-gray-900 text-white rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold tabular-nums">{fmt(walletBalance)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-400">
            <span>Topped up: {fmt(totalCredited)}</span>
            <span>Spent: {fmt(totalSpend)}</span>
          </div>
          <Link href="/dashboard/client/billing"
            className="mt-4 block text-center py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Top Up →
          </Link>
        </div>

        {/* Total views */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtViews(totalViewsLifetime)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Views Delivered</p>
        </div>

        {/* Active campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-green-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{activeCampaigns}</p>
          <p className="text-sm text-gray-500 mt-1.5">Active Campaigns</p>
        </div>

        {/* Total spend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-brand-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(totalSpend)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Spend</p>
        </div>
      </div>

      {/* Subscription tier card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
        <div className="flex items-start justify-between gap-6">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Current Plan</h2>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierConfig.badge_class}`}>
                {tierConfig.name}
              </span>
              <span className="text-xs text-gray-400">{tierConfig.price_label}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">Campaigns this month</p>
              <p className="text-xs font-medium text-gray-700 tabular-nums">
                {usedThisMonth} / {campaignLimit ?? '∞'}
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              {campaignLimit ? (
                <div
                  className={`h-2 rounded-full transition-all ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 80 ? 'bg-amber-400' : 'bg-brand-500'}`}
                  style={{ width: `${usagePct}%` }}
                />
              ) : (
                <div className="h-2 rounded-full bg-brand-500 opacity-20 w-full" />
              )}
            </div>
            {campaignLimit && usedThisMonth >= campaignLimit && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">Monthly limit reached — upgrade to create more.</p>
            )}
          </div>

          <div className="flex items-start gap-8 flex-shrink-0">
            <ul className="space-y-1.5">
              {tierConfig.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {upgrade && (
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-400 text-right">
                  Upgrade to <span className="font-semibold text-gray-700">{TIER_CONFIG[upgrade].name}</span>
                </p>
                <p className="text-xs text-gray-500">{TIER_CONFIG[upgrade].price_label}</p>
                <Link href="/dashboard/client/billing"
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${TIER_CONFIG[upgrade].accent_class}`}
                >
                  Upgrade →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Campaigns</h2>
          <Link href="/dashboard/client/campaigns" className="text-sm text-brand-500 hover:underline">View all →</Link>
        </div>

        {cData.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first campaign to start getting clips</p>
            <Link href="/dashboard/client/campaigns/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget Used</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {cData.map((c: any) => {
                  const used    = Number(c.budget_inr) - Number(c.budget_remaining_inr)
                  const usedPct = pct(used, Number(c.budget_inr))
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/client/campaigns/${c.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-brand-500"
                        >{c.title}</Link>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{c.platform}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-24">
                            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${usedPct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 tabular-nums">
                            {fmt(used)} / {fmt(Number(c.budget_inr))}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[c.status] ?? ''}`}>
                          {c.status.replace('_', ' ')}
                        </span>
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
  )
}
