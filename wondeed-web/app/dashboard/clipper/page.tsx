import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { fmtRupee, fmtViews, fmtDate } from '@/lib/format'

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return (
    <span className="badge badge-success">
      <span className="badge-dot" style={{ background: '#16a34a' }} />Approved
    </span>
  )
  if (status === 'rejected') return (
    <span className="badge badge-danger">
      <span className="badge-dot" style={{ background: '#dc2626' }} />Rejected
    </span>
  )
  return (
    <span className="badge badge-warn">
      <span className="badge-dot" style={{ background: '#d97706' }} />Pending review
    </span>
  )
}

function PlatformPill({ platform }: { platform: string }) {
  const isIg = platform === 'instagram'
  const isYt = platform === 'youtube'
  return (
    <span className={`platform ${isIg ? 'ig' : isYt ? 'yt' : ''}`}>
      {isIg && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
        </svg>
      )}
      {isYt && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 5 12 5 12 5s-4 0-7.1.1c-.4 0-1.3 0-2.1.9C2.2 6.6 2 8 2 8s-.2 1.6-.2 3.3v1.4c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.3.9 1.6.2 7 .2 7 .2s4 0 7.1-.1c.4 0 1.3 0 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.4C22.2 9.6 22 8 22 8z"/><path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="currentColor"/>
        </svg>
      )}
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  )
}

export default async function ClipperHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    profileResult,
    walletResult,
    thisMonthEarningsResult,
    totalViewsResult,
    activeCampaignsResult,
    recentSubmissionsResult,
  ] = await Promise.all([
    db.from('profiles').select('full_name, subscription_tier').eq('id', user!.id).single(),
    db.from('wallets').select('balance_inr, total_credited_inr').eq('user_id', user!.id).maybeSingle(),
    db.from('earnings').select('amount_inr').eq('clipper_id', user!.id).gte('created_at', monthStart),
    db.from('campaign_submissions').select('capped_view_count').eq('clipper_id', user!.id).eq('status', 'approved'),
    db.from('campaign_submissions').select('campaign_id').eq('clipper_id', user!.id).in('status', ['pending', 'approved']),
    db.from('campaign_submissions')
      .select('id, clip_url, platform, status, capped_view_count, earnings_inr, created_at, campaigns(title)')
      .eq('clipper_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const profile = profileResult.data as any
  const wallet  = walletResult.data as any
  const displayName = profile?.full_name ?? 'Clipper'
  const firstName   = displayName.split(' ')[0]

  const thisMonthEarnings = (thisMonthEarningsResult.data ?? []).reduce((s: number, e: any) => s + Number(e.amount_inr), 0)
  const totalViews        = (totalViewsResult.data ?? []).reduce((s: number, v: any) => s + Number(v.capped_view_count ?? 0), 0)
  const activeCampaigns   = new Set((activeCampaignsResult.data ?? []).map((s: any) => s.campaign_id)).size
  const walletBalance     = Number(wallet?.balance_inr ?? 0)
  const recentSubs        = (recentSubmissionsResult.data ?? []) as any[]

  const stats = [
    { label: 'Wallet Balance',   value: fmtRupee(walletBalance),      delta: 'Available for payout', ico: 'wallet',  cls: 'ico-indigo' },
    { label: 'This Month',       value: fmtRupee(thisMonthEarnings),  delta: 'May 2026',             ico: 'trend',   cls: 'ico-green'  },
    { label: 'Total Views',      value: fmtViews(totalViews),         delta: 'Verified views',       ico: 'eye',     cls: 'ico-violet', flat: true },
    { label: 'Active Campaigns', value: String(activeCampaigns),      delta: 'In progress',          ico: 'layers',  cls: 'ico-amber',  flat: true },
  ]

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Hey {firstName} 👋</h1>
          <div className="topbar-sub">Here's your performance overview for {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="topbar-right">
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input placeholder="Search campaigns, clips, earnings…" />
          </div>
          <Link href="/dashboard/clipper/feed" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Browse Campaigns
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-ico ${s.cls}`}>
                <StatIcon name={s.ico} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <span className={`stat-delta ${s.flat ? 'flat' : ''}`}>
                {!s.flat && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                )}
                {s.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Recent submissions */}
        <div className="card mb-20">
          <div className="card-head">
            <div>
              <h2>Recent Submissions</h2>
              <div className="sub">Clips you've submitted — pending review or recently approved</div>
            </div>
            <div className="card-head-right">
              <Link href="/dashboard/clipper/my-campaigns" className="btn btn-secondary btn-sm">View all</Link>
            </div>
          </div>
          <div className="tbl-wrap">
            {recentSubs.length === 0 ? (
              <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                No submissions yet.{' '}
                <Link href="/dashboard/clipper/feed" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>Browse campaigns →</Link>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Platform</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Views</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubs.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="col">
                          <div className="med">{(s.campaigns as any)?.title ?? '—'}</div>
                          <div className="text-xs faint mono mt-4">{s.id} · {s.clip_url}</div>
                        </div>
                      </td>
                      <td><PlatformPill platform={s.platform} /></td>
                      <td className="muted">{fmtDate(s.created_at)}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{fmtViews(Number(s.capped_view_count ?? 0))}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td className="num bold" style={{ textAlign: 'right' }}>
                        {s.earnings_inr != null ? fmtRupee(Number(s.earnings_inr)) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card-head" style={{ padding: '0 0 12px', border: 'none' }}>
          <div>
            <h2 style={{ fontSize: 15 }}>Quick Actions</h2>
          </div>
        </div>
        <div className="g4">
          {[
            { href: '/dashboard/clipper/feed',      label: 'Browse Campaigns', sub: 'Find new campaigns', color: 'var(--primary-50)',  text: 'var(--primary-700)', ico: 'grid' },
            { href: '/dashboard/clipper/submit',     label: 'Submit a Clip',    sub: 'Upload your content',color: '#eff6ff', text: '#1d4ed8', ico: 'upload' },
            { href: '/dashboard/clipper/analytics',  label: 'View Analytics',   sub: 'Track your views',  color: '#f5f3ff', text: '#6d28d9', ico: 'chart' },
            { href: '/dashboard/clipper/earnings',   label: 'Request Payout',   sub: 'Withdraw earnings', color: '#fefce8', text: '#a16207', ico: 'wallet' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="card" style={{ padding: '18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color, color: a.text, display: 'grid', placeItems: 'center' }}>
                <StatIcon name={a.ico} />
              </div>
              <div>
                <div className="bold text-md" style={{ color: 'var(--fg)' }}>{a.label}</div>
                <div className="text-xs faint mt-4">{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

function StatIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    wallet:  <><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/><path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></>,
    trend:   <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    layers:  <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></>,
    grid:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    upload:  <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
    chart:   <><path d="M3 21h18"/><rect x="5" y="11" width="3" height="8"/><rect x="10.5" y="6" width="3" height="13"/><rect x="16" y="14" width="3" height="5"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      {paths[name]}
    </svg>
  )
}
