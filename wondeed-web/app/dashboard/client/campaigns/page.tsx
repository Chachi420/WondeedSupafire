import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { pauseCampaign, resumeCampaign } from '@/app/dashboard/client/actions'

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

function deadlineLabel(endDate: string | null, durationDays: number | null, createdAt: string): string {
  const refDate = endDate
    ? new Date(endDate)
    : durationDays
      ? new Date(new Date(createdAt).getTime() + durationDays * 86_400_000)
      : null

  if (!refDate) return 'No deadline'
  const diff = Math.ceil((refDate.getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return 'Expired'
  if (diff === 0) return 'Today'
  return `${diff}d left`
}

function deadlineColor(label: string): string {
  if (label === 'Expired') return 'text-red-600'
  if (label === 'Today')   return 'text-red-500'
  if (label.startsWith('No')) return 'text-gray-400'
  const days = parseInt(label)
  if (days <= 3) return 'text-red-500'
  if (days <= 7) return 'text-amber-600'
  return 'text-gray-600'
}

export default async function ClientCampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: campaigns, count } = await db
    .from('campaigns')
    .select(
      'id, title, status, budget_inr, budget_remaining_inr, platform, ' +
      'start_date, end_date, duration_days, created_at, ' +
      'campaign_submissions(capped_view_count, status)',
      { count: 'exact' }
    )
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count ?? 0} total campaigns</p>
        </div>
        <Link
          href="/dashboard/client/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </Link>
      </div>

      {!(campaigns as any[])?.length ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-20 text-center">
          <p className="text-sm font-medium text-gray-900 mb-2">No campaigns yet</p>
          <p className="text-sm text-gray-400 mb-6">Create your first campaign and start getting views</p>
          <Link href="/dashboard/client/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Views Delivered</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget Remaining</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns as any[]).map((c) => {
                const submissions  = (c.campaign_submissions as any[]) ?? []
                const totalViews   = submissions
                  .filter((s: any) => s.status === 'approved')
                  .reduce((sum: number, s: any) => sum + (Number(s.capped_view_count) || 0), 0)
                const usedPct      = c.budget_inr > 0
                  ? Math.min(100, Math.round(((Number(c.budget_inr) - Number(c.budget_remaining_inr)) / Number(c.budget_inr)) * 100))
                  : 0
                const deadline     = deadlineLabel(c.end_date, c.duration_days, c.created_at)
                const dlColor      = deadlineColor(deadline)

                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/client/campaigns/${c.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-brand-500 transition-colors"
                      >
                        {c.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{c.platform}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[c.status] ?? ''}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
                      <p className="text-xs text-gray-400">
                        {submissions.filter((s: any) => s.status === 'approved').length} clips
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900 tabular-nums">{fmt(Number(c.budget_remaining_inr))}</p>
                      <div className="mt-1 bg-gray-100 rounded-full h-1 w-20">
                        <div
                          className="bg-brand-500 h-1 rounded-full"
                          style={{ width: `${100 - usedPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className={`text-sm font-medium tabular-nums ${dlColor}`}>{deadline}</p>
                      {c.end_date && <p className="text-xs text-gray-400">{c.end_date}</p>}
                    </td>

                    <td className="px-5 py-4">
                      {c.status === 'active' && (
                        <form action={pauseCampaign.bind(null, c.id)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                            </svg>
                            Pause
                          </button>
                        </form>
                      )}
                      {c.status === 'paused' && (
                        <form action={resumeCampaign.bind(null, c.id)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Resume
                          </button>
                        </form>
                      )}
                      {!['active', 'paused'].includes(c.status) && (
                        <span className="text-xs text-gray-300">—</span>
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
