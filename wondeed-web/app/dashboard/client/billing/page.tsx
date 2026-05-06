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

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    active: 'Active', completed: 'Completed', cancelled: 'Cancelled',
    pending_approval: 'Pending', draft: 'Draft', paused: 'Paused',
  }
  return <span className="badge badge-neutral">{labels[status] ?? status}</span>
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

  const balance  = Number((walletResult.data as any)?.balance_inr         ?? 0)
  const credited = Number((walletResult.data as any)?.total_credited_inr  ?? 0)
  const debited  = Number((walletResult.data as any)?.total_debited_inr   ?? 0)

  const campaigns     = (campaignsResult.data     as any[]) ?? []
  const subscriptions = (subscriptionsResult.data as any[]) ?? []

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Billing</h1>
          <div className="topbar-sub">Your plan, wallet, and transaction history</div>
        </div>
      </div>

      <div className="content fade-up">
        {/* Wallet hero */}
        <div className="wallet-hero mb-20">
          <div className="row between items-start">
            <div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Wallet Balance
              </div>
              <div className="mt-8" style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {fmt(balance)}
              </div>
              <div className="mt-12 row gap-12 text-md" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <span>Topped up: {fmt(credited)}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>Spent: {fmt(debited)}</span>
              </div>
            </div>
            <div className="col gap-8 items-end">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {tierConfig.name} Plan
              </span>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{tierConfig.price_label}</div>
            </div>
          </div>
          <div className="row gap-12 mt-16" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            <span>Top-up via Razorpay coming in Phase 2</span>
            <span>·</span>
            <span>Contact admin to add funds now</span>
          </div>
        </div>

        {/* Current plan */}
        <div className="card mb-20">
          <div className="card-head">
            <div>
              <h2>Current Plan</h2>
              <div className="sub">{tierConfig.name} — {tierConfig.price_label}</div>
            </div>
            <div className="card-head-right">
              {upgrade && (
                <button disabled className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  Upgrade — Coming Soon
                </button>
              )}
            </div>
          </div>
          <div style={{ padding: '20px 24px' }} className="col gap-12">
            {tierConfig.features.map((f: string) => (
              <div key={f} className="row gap-8 text-xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: 'var(--success)', flexShrink: 0 }}>
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                {f}
              </div>
            ))}

            {upgrade && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                <div className="text-xs faint mb-12">Available upgrades</div>
                <div className="col gap-8">
                  {TIER_ORDER.filter((t: SubscriptionTier) => TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(tier)).map((t: SubscriptionTier) => {
                    const tc = TIER_CONFIG[t]
                    return (
                      <div key={t} className="row between" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                        <div className="row gap-10">
                          <span className="badge badge-neutral">{tc.name}</span>
                          <span className="text-xs faint">{tc.features[0]}</span>
                        </div>
                        <span className="text-xs faint">{tc.price_label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {subscriptions.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div className="text-xs faint mb-12">Subscription history</div>
                {subscriptions.map((s: any, i: number) => (
                  <div key={i} className="row between text-xs" style={{ padding: '6px 0' }}>
                    <span className="med" style={{ textTransform: 'capitalize' }}>{s.tier} plan</span>
                    <span className="faint">
                      {new Date(s.starts_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      {s.ends_at && ` → ${new Date(s.ends_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                    </span>
                    <span>{fmt(Number(s.amount_inr))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spend history */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Campaign Spend History</h2>
              <div className="sub">Wallet is debited when you submit a campaign</div>
            </div>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>No transactions yet</div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/dashboard/client/campaigns/${c.id}`} className="med" style={{ color: 'var(--fg)', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </td>
                      <td className="muted">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="num bold" style={{ textAlign: 'right' }}>{fmt(Number(c.total_charged_inr))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
