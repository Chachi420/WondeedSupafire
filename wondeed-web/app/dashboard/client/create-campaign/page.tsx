import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import CreateCampaignForm from '@/components/client/CreateCampaignForm'
import { TIER_CONFIG } from '@/lib/tiers'
import type { SubscriptionTier } from '@/lib/tiers'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

export default async function CreateCampaignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()

  const [walletResult, profileResult] = await Promise.all([
    db.from('wallets').select('balance_inr').eq('user_id', user.id).maybeSingle(),
    db.from('profiles').select('subscription_tier').eq('id', user.id).single(),
  ])

  const walletBalance = Number(walletResult.data?.balance_inr ?? 0)
  const tier          = (profileResult.data?.subscription_tier ?? 'pro') as SubscriptionTier
  const tierConfig    = TIER_CONFIG[tier]

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/client/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          My Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Campaign will be submitted directly for admin approval. Budget is deducted from your wallet on submission.
        </p>
      </div>

      {/* Wallet + tier banner */}
      <div className="flex items-stretch gap-4 mb-8">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Wallet Balance</p>
            <p className={`text-xl font-bold ${walletBalance >= 20_000 ? 'text-gray-900' : 'text-red-600'}`}>
              {fmt(walletBalance)}
            </p>
          </div>
          {walletBalance < 20_000 && (
            <Link
              href="/dashboard/client/wallet"
              className="ml-auto px-3 py-1.5 text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              Top Up →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierConfig.badge_class}`}>
            {tierConfig.name}
          </span>
          <div>
            <p className="text-xs text-gray-500">Monthly limit</p>
            <p className="text-sm font-semibold text-gray-900">
              {isFinite(tierConfig.campaign_limit) ? `${tierConfig.campaign_limit} campaigns` : 'Unlimited'}
            </p>
          </div>
        </div>
      </div>

      {walletBalance < 20_000 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">Insufficient wallet balance</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You need at least ₹24,000 (₹20,000 budget + 20% platform fee) to create a campaign.
              Your current balance is {fmt(walletBalance)}.
            </p>
            <Link href="/dashboard/client/wallet" className="inline-block mt-2 text-xs font-medium text-amber-800 underline">
              Top up your wallet →
            </Link>
          </div>
        </div>
      )}

      <CreateCampaignForm walletBalance={walletBalance} />
    </div>
  )
}
