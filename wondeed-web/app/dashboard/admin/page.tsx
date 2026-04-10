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
      .select('id, platform, status, created_at, campaigns(title), profiles(full_name, phone)')
      .order('created_at', { ascending: false }).limit(5),
  ])
  return { campaigns: campaigns ?? [], submissions: submissions ?? [] }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_approval: 'bg-amber-100 text-amber-800',
    active:           'bg-green-100 text-green-800',
    completed:        'bg-gray-100 text-gray-500',
    cancelled:        'bg-red-100 text-red-700',
    draft:            'bg-gray-100 text-gray-500',
    pending:          'bg-blue-100 text-blue-800',
    approved:         'bg-green-100 text-green-800',
    rejected:         'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

const STAT_CARDS = [
  { label: 'Pending Campaigns',   key: 'pendingCampaigns',   href: '/dashboard/admin/campaigns',   dot: 'bg-amber-400'  },
  { label: 'Pending Submissions', key: 'pendingSubmissions',  href: '/dashboard/admin/submissions',  dot: 'bg-blue-500'   },
  { label: 'Pending Payouts',     key: 'pendingPayouts',     href: '/dashboard/admin/payouts',     dot: 'bg-violet-500' },
  { label: 'Total Users',         key: 'totalUsers',         href: '/dashboard/admin/users',       dot: 'bg-indigo-500' },
] as const

export default async function AdminOverviewPage() {
  const [stats, { campaigns, submissions }] = await Promise.all([getStats(), getRecentActivity()])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wondeed operations dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-10">
        {STAT_CARDS.map((card) => (
          <Link key={card.key} href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className={`w-2 h-2 rounded-full ${card.dot} mb-4`} />
            <p className="text-3xl font-bold text-gray-900 tabular-nums">
              {stats[card.key]}
            </p>
            <p className="text-sm text-gray-500 mt-1.5 group-hover:text-indigo-600 transition-colors">
              {card.label} →
            </p>
          </Link>
        ))}
      </div>

      {/* Recent activity tables */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Campaigns</h2>
            <Link href="/dashboard/admin/campaigns" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          {campaigns.length === 0
            ? <p className="px-5 py-10 text-sm text-gray-400 text-center">No campaigns yet</p>
            : <ul className="divide-y divide-gray-50">
                {campaigns.map((c: any) => (
                  <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.profiles?.full_name ?? c.profiles?.phone ?? '—'}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
          }
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/dashboard/admin/submissions" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          {submissions.length === 0
            ? <p className="px-5 py-10 text-sm text-gray-400 text-center">No submissions yet</p>
            : <ul className="divide-y divide-gray-50">
                {submissions.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{(s.campaigns as any)?.title ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(s.profiles as any)?.full_name ?? (s.profiles as any)?.phone ?? '—'} · {s.platform}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
          }
        </div>

      </div>
    </div>
  )
}
