import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function cpm(spend: number, views: number): string {
  if (views === 0) return '—'
  return fmt((spend / views) * 1000)
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  // Fetch all campaigns with their submissions
  const [campaignsResult, walletResult] = await Promise.all([
    db.from('campaigns')
      .select(
        'id, title, status, budget_inr, budget_remaining_inr, created_at, ' +
        'campaign_submissions(capped_view_count, status)'
      )
      .eq('client_id', user!.id)
      .not('status', 'in', '("draft")')
      .order('created_at', { ascending: false }),
    db.from('wallets')
      .select('total_debited_inr')
      .eq('user_id', user!.id)
      .single(),
  ])

  const campaigns    = (campaignsResult.data as any[]) ?? []
  const totalSpend   = Number((walletResult.data as any)?.total_debited_inr ?? 0)

  // Compute per-campaign stats
  const withStats = campaigns.map((c: any) => {
    const subs         = (c.campaign_submissions as any[]) ?? []
    const approved     = subs.filter((s: any) => s.status === 'approved')
    const totalViews   = approved.reduce((sum: number, s: any) => sum + (Number(s.capped_view_count) || 0), 0)
    const budgetUsed   = Number(c.budget_inr) - Number(c.budget_remaining_inr)
    return { ...c, totalViews, budgetUsed, approvedClips: approved.length, pendingClips: subs.filter((s: any) => s.status === 'pending').length }
  })

  const totalViews     = withStats.reduce((sum, c) => sum + c.totalViews, 0)
  const totalCampaigns = withStats.filter(c => c.status !== 'cancelled').length
  const avgCPM         = totalViews > 0 ? (totalSpend / totalViews) * 1_000 : 0

  // Sort by views for the "top performing" display
  const byViews = [...withStats].sort((a, b) => b.totalViews - a.totalViews)

  const STATUS_DOT: Record<string, string> = {
    active:           'bg-green-500',
    paused:           'bg-blue-400',
    completed:        'bg-gray-400',
    cancelled:        'bg-red-400',
    pending_approval: 'bg-amber-400',
    draft:            'bg-gray-300',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Lifetime performance across all your campaigns</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-5 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-indigo-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Views Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-brand-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{fmt(totalSpend)}</p>
          <p className="text-sm text-gray-500 mt-1.5">Total Spend</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">
            {totalViews > 0 ? fmt(avgCPM) : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1.5">Avg. CPM</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-2 h-2 rounded-full bg-gray-400 mb-4" />
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{totalCampaigns}</p>
          <p className="text-sm text-gray-500 mt-1.5">Campaigns Run</p>
        </div>
      </div>

      {/* Campaign performance table */}
      {byViews.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-sm font-medium text-gray-900 mb-2">No campaign data yet</p>
          <p className="text-sm text-gray-400 mb-6">Submit a campaign and get it approved to start seeing analytics</p>
          <Link href="/dashboard/client/create-campaign"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Campaign Performance</h2>
            <p className="text-xs text-gray-400">Sorted by views delivered</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Spend</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">CPM</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Clips</th>
              </tr>
            </thead>
            <tbody>
              {byViews.map((c: any) => {
                const maxViews = Math.max(...byViews.map((x: any) => x.totalViews), 1)
                const barPct   = Math.round((c.totalViews / maxViews) * 100)
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/client/campaigns/${c.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-500"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] ?? 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600 capitalize">{c.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">{fmtViews(c.totalViews)}</p>
                      {c.totalViews > 0 && (
                        <div className="mt-1 bg-gray-100 rounded-full h-1 w-20 ml-auto">
                          <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${barPct}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-700 tabular-nums">{fmt(c.budgetUsed)}</td>
                    <td className="px-5 py-4 text-right text-sm text-gray-600 tabular-nums">{cpm(c.budgetUsed, c.totalViews)}</td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm text-gray-900">{c.approvedClips}</p>
                      {c.pendingClips > 0 && (
                        <p className="text-xs text-amber-600">{c.pendingClips} pending</p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
