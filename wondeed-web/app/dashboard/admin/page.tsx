import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

async function getStats() {
  const db = createAdminClient()
  const [pendingCampaigns, pendingSubmissions, activeCount, userCount, pendingPayouts] = await Promise.all([
    db.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('payouts').select('id', { count: 'exact', head: true }).in('status', ['requested', 'processing']),
  ])
  return {
    pendingCampaigns:   pendingCampaigns.count  ?? 0,
    pendingSubmissions: pendingSubmissions.count ?? 0,
    activeCampaigns:    activeCount.count        ?? 0,
    totalUsers:         userCount.count          ?? 0,
    pendingPayouts:     pendingPayouts.count     ?? 0,
  }
}

async function getRecentActivity() {
  const db = createAdminClient()
  const [{ data: campaigns }, { data: submissions }] = await Promise.all([
    db.from('campaigns')
      .select('id, title, status, created_at, profiles(full_name, phone)')
      .order('created_at', { ascending: false }).limit(5),
    db.from('campaign_submissions')
      .select('id, platform, status, created_at, campaigns(title), profiles!clipper_id(full_name, phone)')
      .order('created_at', { ascending: false }).limit(5),
  ])
  return { campaigns: campaigns ?? [], submissions: submissions ?? [] }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active' || status === 'approved') return <span className="badge badge-success">{status.replace('_', ' ')}</span>
  if (status === 'pending' || status === 'pending_approval') return <span className="badge badge-warn">{status.replace('_', ' ')}</span>
  if (status === 'rejected' || status === 'cancelled') return <span className="badge badge-danger">{status.replace('_', ' ')}</span>
  return <span className="badge badge-neutral">{status.replace('_', ' ')}</span>
}

const STAT_CARDS = [
  { label: 'Pending Campaigns',   key: 'pendingCampaigns',   href: '/dashboard/admin/campaigns',   ico: 'folder', cls: 'ico-amber'  },
  { label: 'Pending Submissions', key: 'pendingSubmissions',  href: '/dashboard/admin/submissions',  ico: 'inbox',  cls: 'ico-blue'   },
  { label: 'Pending Payouts',     key: 'pendingPayouts',     href: '/dashboard/admin/payouts',     ico: 'wallet', cls: 'ico-violet' },
  { label: 'Total Users',         key: 'totalUsers',         href: '/dashboard/admin/users',       ico: 'users',  cls: 'ico-green'  },
] as const

function StatIco({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>,
    inbox:  <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></>,
    wallet: <><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v2H5a2 2 0 00-2 2V7z"/><path d="M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></>,
    users:  <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="6" r="2.5"/><path d="M16 13c3 0 6 2 6 5"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      {paths[name]}
    </svg>
  )
}

export default async function AdminOverviewPage() {
  const [stats, { campaigns, submissions }] = await Promise.all([getStats(), getRecentActivity()])

  return (
    <>
      <div className="topbar">
        <div className="col">
          <h1>Overview</h1>
          <div className="topbar-sub">Wondeed operations dashboard · Live data</div>
        </div>
        <div className="topbar-right">
          <Link href="/dashboard/admin/submissions" className="btn btn-primary">
            Review Queue
            {stats.pendingSubmissions > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 4 }}>{stats.pendingSubmissions}</span>
            )}
          </Link>
        </div>
      </div>

      <div className="content fade-up">
        <div className="stat-grid">
          {STAT_CARDS.map((card) => (
            <Link key={card.key} href={card.href} className="stat-card" style={{ textDecoration: 'none', display: 'block' }}>
              <div className={`stat-ico ${card.cls}`}><StatIco name={card.ico} /></div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{stats[card.key]}</div>
            </Link>
          ))}
        </div>

        <div className="g2">
          <div className="card">
            <div className="card-head">
              <div><h2>Recent Campaigns</h2></div>
              <div className="card-head-right">
                <Link href="/dashboard/admin/campaigns" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
            </div>
            {campaigns.length === 0 ? (
              <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>No campaigns yet</div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Campaign</th><th>By</th><th>Status</th></tr></thead>
                  <tbody>
                    {campaigns.map((c: any) => (
                      <tr key={c.id}>
                        <td className="med truncate" style={{ maxWidth: 200 }}>{c.title}</td>
                        <td className="muted">{c.profiles?.full_name ?? c.profiles?.phone ?? '—'}</td>
                        <td><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <div><h2>Recent Submissions</h2></div>
              <div className="card-head-right">
                <Link href="/dashboard/admin/submissions" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
            </div>
            {submissions.length === 0 ? (
              <div style={{ padding: '48px 28px', textAlign: 'center', color: 'var(--fg-muted)' }}>No submissions yet</div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Campaign</th><th>Clipper</th><th>Status</th></tr></thead>
                  <tbody>
                    {submissions.map((s: any) => (
                      <tr key={s.id}>
                        <td className="med truncate" style={{ maxWidth: 180 }}>{(s.campaigns as any)?.title ?? '—'}</td>
                        <td className="muted">{(s.profiles as any)?.full_name ?? (s.profiles as any)?.phone ?? '—'}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
