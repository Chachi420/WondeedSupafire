import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { TIER_CONFIG, TIER_ORDER, nextTier } from '@/lib/tiers'
import type { SubscriptionTier } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  active:           'Active',
  completed:        'Completed',
  cancelled:        'Cancelled',
  pending_approval: 'Pending',
  draft:            'Draft',
  paused:           'Paused',
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const [profileResult, walletResult, campaignsResult, subscriptionsResult] = await Promise.all([
    db.from('profiles').select('full_name, phone, subscription_tier').eq('id', user!.id).single(),
    db.from('wallets').select('balance_inr, total_credited_inr, total_debited_inr').eq('user_id', user!.id).single(),
    db.from('campaigns')
      .select('id, title, status, total_charged_inr, created_at')
      .eq('client_id', user!.id)
      .not('status', 'eq', 'draft')
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('subscriptions')
      .select('tier, status, amount_inr, starts_at, ends_at')
      .eq('client_id', user!.id)
      .order('starts_at', { ascending: false })
      .limit(5),
  ])

  const tier       = ((profileResult.data as any)?.subscription_tier ?? 'pro') as SubscriptionTier
  const tierConfig = TIER_CONFIG[tier]
  const upgrade    = nextTier(tier)

  const balance   = Number((walletResult.data as any)?.balance_inr ?? 0)
  const credited  = Number((walletResult.data as any)?.total_credited_inr ?? 0)
  const debited   = Number((walletResult.data as any)?.total_debited_inr ?? 0)

  const campaigns     = (campaignsResult.data as any[]) ?? []
  const subscriptions = (subscriptionsResult.data as any[]) ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your plan, wallet, and transaction history</p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Current Plan</h2>

        <div className="flex items-start gap-8">
          {/* Active tier */}
          <div className={`flex-1 rounded-xl border-2 p-5 ${
            tier === 'pro'        ? 'border-gray-200 bg-gray-50' :
            tier === 'premium'    ? 'border-blue-300 bg-blue-50' :
            'border-purple-300 bg-purple-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierConfig.badge_class}`}>
                {tierConfig.name} — Active
              </span>
              <span className="text-sm font-bold text-gray-900">{tierConfig.price_label}</span>
            </div>
            <ul className="space-y-1.5">
              {tierConfig.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade tiers */}
          {upgrade && (
            <div className="flex flex-col gap-4 flex-shrink-0 w-56">
              {TIER_ORDER.filter(t => TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(tier)).map(t => {
                const tc = TIER_CONFIG[t]
                return (
                  <div key={t} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${tc.badge_class}`}>
                        {tc.name}
                      </span>
                      <span className="text-xs font-bold text-gray-700">{tc.price_label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{tc.features[0]}</p>
                    <button
                      disabled
                      className={`w-full py-2 rounded-lg text-xs font-semibold opacity-60 cursor-not-allowed ${tc.accent_class}`}
                    >
                      Upgrade — Coming Soon
                    </button>
                  </div>
                )
              })}
              <p className="text-xs text-gray-400 text-center">Contact us to upgrade your plan</p>
            </div>
          )}
        </div>

        {/* Subscription history */}
        {subscriptions.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Subscription History</p>
            <ul className="space-y-2">
              {subscriptions.map((s: any, i: number) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{s.tier} plan</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(s.starts_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    {s.ends_at && ` → ${new Date(s.ends_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                  </span>
                  <span className="text-gray-600">{fmt(Number(s.amount_inr))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="bg-gray-900 text-white rounded-xl p-6 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Wallet Balance</p>
        <p className="text-4xl font-bold tabular-nums mb-5">{fmt(balance)}</p>

        <div className="grid grid-cols-2 gap-6 pt-5 border-t border-gray-700 text-sm mb-5">
          <div>
            <p className="text-gray-400 mb-0.5">Total topped up</p>
            <p className="text-lg font-semibold tabular-nums">{fmt(credited)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Total spent on campaigns</p>
            <p className="text-lg font-semibold tabular-nums">{fmt(debited)}</p>
          </div>
        </div>

        {/* Top-up grid */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Top Up Wallet</p>
            <span className="text-xs bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded">
              Razorpay — Phase 2
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[5_000, 10_000, 25_000, 50_000, 1_00_000, 2_00_000].map(amt => (
              <button key={amt} disabled
                className="py-2 bg-white/10 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
              >
                {fmt(amt)}
              </button>
            ))}
          </div>
          <button disabled
            className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed"
          >
            Pay via Razorpay
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            To add funds during testing, contact the admin team.
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Campaign Spend History</h2>
          <p className="text-xs text-gray-400 mt-0.5">Wallet is debited when admin approves a campaign</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/client/campaigns/${c.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-brand-500"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-600">
                      {CAMPAIGN_STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900 tabular-nums">
                    {fmt(Number(c.total_charged_inr))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
