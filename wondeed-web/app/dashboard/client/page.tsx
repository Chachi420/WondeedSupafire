import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { TIER_CONFIG, nextTier } from '@/lib/tiers'
import type { SubscriptionTier } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

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

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')           return <span className="badge badge-success">{status.replace('_', ' ')}</span>
  if (status === 'pending_approval') return <span className="badge badge-warn">pending approval</span>
  if (status === 'rejected' || status === 'cancelled') return <span className="badge badge-danger">{status}</span>
  return <span className="badge badge-neutral">{status.replace('_', ' ')}</span>
}

function StatIco({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    wallet: <><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/><path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></>,
    eye:    <><path d="M22 12s-4-7-10-7S2 12 2 12s4 7 10 7 10-7 10-7z"/><circle cx="12" cy="12" r="3"/></>,
    folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>,
    chart:  <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      {paths[name]}
    </svg>
  )
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

  const tier           = (((profile.data as any)?.subscription_tier) ?? 'pro') as SubscriptionTier
  const tierConfig     = TIER_CONFIG[tier]
  const upgrade        = nextTier(tier)
  const usedThisMonth  = monthCount.count ?? 0
  const campaignLimit  = isFinite(tierConfig.campaign_limit) ? tierConfig.campaign_limit : null
  const usagePct       = campaignLimit ? pct(usedThisMonth, campaignLimit) : 0

  const cData            = (campaigns.data as any[]) ?? []
  const activeCampaigns  = cData.filter(c => c.status === 'active').length
  const totalSpend       = Number((wallet.data as any)?.total_debited_inr ?? 0)
  const walletBalance    = Number((wallet.data as any)?.balance_inr ?? 0)
  const totalCredited    = Number((wallet.data as any)?.total_credited_inr ?? 0)

  const firstName = (profile.data as any)?.full_name?.split(' ')[0]
    ?? (profile.data as any)?.phone
    ?? 'there'

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Hey {firstName} 👋</h1>
          <div className="topbar-sub">Here&apos;s your campaign performance at a glance</div>
        </div>
        <div className="topbar-right">
          <Link href="/dashboard/client/create-campaign" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M12 4v16m8-8H4"/>
            </svg>
            New Campaign
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-ico ico-violet"><StatIco name="wallet" /></div>
            <div className="stat-label">Wallet Balance</div>
            <div className="stat-value">{fmt(walletBalance)}</div>
            <div className="stat-delta flat" style={{ fontSize: 11 }}>Topped up: {fmt(totalCredited)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-blue"><StatIco name="eye" /></div>
            <div className="stat-label">Views Delivered</div>
            <div className="stat-value">{fmtViews(totalViewsLifetime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-green"><StatIco name="folder" /></div>
            <div className="stat-label">Active Campaigns</div>
            <div className="stat-value">{activeCampaigns}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-amber"><StatIco name="chart" /></div>
            <div className="stat-label">Total Spend</div>
            <div className="stat-value">{fmt(totalSpend)}</div>
          </div>
        </div>

        {/* Tier card */}
        <div className="card mb-20">
          <div className="card-head">
            <div>
              <h2>Current Plan</h2>
              <div className="sub">
                <span style={{ marginRight: 8 }}>{tierConfig.name}</span>
                <span className="faint">{tierConfig.price_label}</span>
              </div>
            </div>
            <div className="card-head-right">
              {upgrade && (
                <Link href="/dashboard/client/billing" className="btn btn-primary btn-sm">
                  Upgrade to {TIER_CONFIG[upgrade].name} →
                </Link>
              )}
            </div>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div className="row between mb-8">
              <span className="text-xs faint">Campaigns this month</span>
              <span className="text-xs med">{usedThisMonth} / {campaignLimit ?? '∞'}</span>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className="progress-bar"
                style={{
                  width: campaignLimit ? `${usagePct}%` : '20%',
                  background: usagePct >= 100 ? 'var(--danger)' : usagePct >= 80 ? '#d97706' : 'var(--primary)',
                  opacity: campaignLimit ? 1 : 0.25,
                }}
              />
            </div>
            {campaignLimit && usedThisMonth >= campaignLimit && (
              <div className="text-xs mt-8" style={{ color: 'var(--danger)' }}>
                Monthly limit reached — upgrade to create more.
              </div>
            )}
            <div className="row gap-16 mt-12 flex-wrap">
              {tierConfig.features.map((f: string) => (
                <span key={f} className="row gap-6 text-xs faint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, color: 'var(--success)' }}>
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Recent Campaigns</h2>
              <div className="sub">Your last 5 campaigns</div>
            </div>
            <div className="card-head-right">
              <Link href="/dashboard/client/campaigns" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
          </div>

          {cData.length === 0 ? (
            <div style={{ padding: '64px 28px', textAlign: 'center' }} className="col gap-12 items-center">
              <div className="faint" style={{ fontSize: 13 }}>No campaigns yet</div>
              <Link href="/dashboard/client/create-campaign" className="btn btn-primary">
                Create your first campaign →
              </Link>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Platform</th>
                    <th>Budget Used</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cData.map((c: any) => {
                    const used    = Number(c.budget_inr) - Number(c.budget_remaining_inr)
                    const usedPct = pct(used, Number(c.budget_inr))
                    return (
                      <tr key={c.id}>
                        <td>
                          <Link href={`/dashboard/client/campaigns/${c.id}`} className="med" style={{ color: 'var(--fg)', textDecoration: 'none' }}>
                            {c.title}
                          </Link>
                        </td>
                        <td className="muted" style={{ textTransform: 'capitalize' }}>{c.platform}</td>
                        <td>
                          <div className="row gap-10 items-center">
                            <div className="progress" style={{ width: 80, height: 4 }}>
                              <div className="progress-bar" style={{ width: `${usedPct}%` }} />
                            </div>
                            <span className="text-xs faint">{fmt(used)} / {fmt(Number(c.budget_inr))}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
