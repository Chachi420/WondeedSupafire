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
    <>
      <div className="topbar">
        <div className="col">
          <h1>Create Campaign</h1>
          <div className="topbar-sub">Set up a new performance campaign · Pay only when verified views land</div>
        </div>
        <div className="topbar-right">
          <Link href="/dashboard/client/campaigns" className="btn btn-ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            My Campaigns
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        {/* Wallet + tier quick stats */}
        <div className="g2 mb-20">
          <div className="stat-card">
            <div className="stat-ico ico-violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/>
                <path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/>
                <circle cx="17" cy="14" r="1.4" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-label">Wallet Balance</div>
            <div className="stat-value" style={{ color: walletBalance < 20_000 ? 'var(--danger)' : undefined }}>
              {fmt(walletBalance)}
            </div>
            {walletBalance < 20_000 && (
              <Link href="/dashboard/client/billing" className="stat-delta" style={{ color: 'var(--danger)', textDecoration: 'none', fontSize: 11 }}>
                Top Up →
              </Link>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-label">Current Plan</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{tierConfig.name}</div>
            <div className="stat-delta flat" style={{ fontSize: 11 }}>
              {isFinite(tierConfig.campaign_limit) ? `${tierConfig.campaign_limit} campaigns/month` : 'Unlimited campaigns'}
            </div>
          </div>
        </div>

        {walletBalance < 20_000 && (
          <div className="helper mb-20" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca', color: 'var(--danger)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <div className="bold">Insufficient wallet balance</div>
              <div className="mt-4 text-xs">
                You need at least ₹20,000 (minimum campaign budget). Your current balance is {fmt(walletBalance)}.{' '}
                <Link href="/dashboard/client/billing" style={{ color: 'inherit', fontWeight: 600 }}>Top up →</Link>
              </div>
            </div>
          </div>
        )}

        <CreateCampaignForm walletBalance={walletBalance} />
      </div>
    </>
  )
}
