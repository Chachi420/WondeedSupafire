import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { submitForApproval, cancelCampaign } from '@/app/dashboard/client/actions'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, string> = {
  draft:            'bg-gray-100 text-gray-600',
  pending_approval: 'bg-amber-100 text-amber-800',
  active:           'bg-green-100 text-green-800',
  completed:        'bg-blue-100 text-blue-700',
  cancelled:        'bg-red-100 text-red-700',
}

const SUB_STATUS_STYLE: Record<string, string> = {
  pending:  'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtViews(n: number | null) {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const db = createAdminClient()

  const { data: campaign } = await db
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .eq('client_id', user!.id)
    .single()

  if (!campaign) notFound()

  const { data: submissions } = await db
    .from('campaign_submissions')
    .select('id, clip_url, platform, status, raw_view_count, capped_view_count, earnings_inr, admin_notes, created_at, reviewed_at, profiles(full_name, phone)')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })

  // Analytics aggregates
  const approved   = submissions?.filter(s => s.status === 'approved') ?? []
  const totalViews = approved.reduce((sum, s) => sum + (Number(s.capped_view_count) || 0), 0)
  const totalEarned= approved.reduce((sum, s) => sum + (Number(s.earnings_inr) || 0), 0)
  const budgetUsed = Number(campaign.budget_inr) - Number(campaign.budget_remaining_inr)
  const usedPct    = campaign.budget_inr > 0
    ? Math.min(100, Math.round((budgetUsed / Number(campaign.budget_inr)) * 100))
    : 0

  const canSubmit  = campaign.status === 'draft'
  const canCancel  = ['draft', 'pending_approval'].includes(campaign.status)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/client/campaigns" className="text-sm text-gray-400 hover:text-gray-600 inline-block mb-3">
          ← All campaigns
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${STATUS_STYLE[campaign.status] ?? ''}`}>
                {campaign.status.replace('_', ' ')}
              </span>
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">{campaign.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {canSubmit && (
              <form action={submitForApproval.bind(null, campaign.id)}>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Submit for Approval →
                </button>
              </form>
            )}
            {campaign.status === 'pending_approval' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">
                Awaiting admin review
              </p>
            )}
            {canCancel && (
              <form action={cancelCampaign.bind(null, campaign.id)}>
                <button
                  type="submit"
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Financials + analytics */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-1">Clipper Budget</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(Number(campaign.budget_inr))}</p>
          <p className="text-xs text-gray-400 mt-1">+20% fee → {fmt(Number(campaign.total_charged_inr))} total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-1">Budget Used</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(budgetUsed)}</p>
          <div className="mt-2 bg-gray-100 rounded-full h-1.5">
            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{usedPct}% used · {fmt(Number(campaign.budget_remaining_inr))} left</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-1">Total Views</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmtViews(totalViews)}</p>
          <p className="text-xs text-gray-400 mt-1">from {approved.length} approved clip{approved.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-1">Paid to Clippers</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(totalEarned)}</p>
          <p className="text-xs text-gray-400 mt-1">
            per-post cap: {fmtViews(Number(campaign.per_post_view_cap))} views
          </p>
        </div>
      </div>

      {/* Campaign meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8 flex items-center gap-10 text-sm">
        <div>
          <span className="text-gray-400">Platform </span>
          <span className="font-medium text-gray-900 capitalize">{campaign.platform}</span>
        </div>
        <div>
          <span className="text-gray-400">Rate </span>
          <span className="font-medium text-gray-900">₹{Number(campaign.rate_per_million_inr).toLocaleString()} / 1M views</span>
        </div>
        <div>
          <span className="text-gray-400">Start </span>
          <span className="font-medium text-gray-900">{campaign.start_date ?? '—'}</span>
        </div>
        <div>
          <span className="text-gray-400">End </span>
          <span className="font-medium text-gray-900">{campaign.end_date ?? 'Until budget exhausted'}</span>
        </div>
      </div>

      {/* Submissions table */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Clip Submissions</h2>
          <span className="text-xs text-gray-400">({submissions?.length ?? 0} total)</span>
        </div>

        {!submissions?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-400">
              {campaign.status === 'active'
                ? 'No clips submitted yet — clippers will see this campaign and submit soon'
                : 'Clips will appear here once the campaign is active'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Clipper</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Clip</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Earned</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s: any) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">
                        {s.profiles?.full_name ?? s.profiles?.phone ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('en-IN')}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={s.clip_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline truncate block max-w-[180px]"
                        title={s.clip_url}
                      >
                        {s.clip_url.replace(/^https?:\/\//, '').substring(0, 30)}…
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{s.platform}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 tabular-nums">
                      {fmtViews(s.capped_view_count)}
                      {s.raw_view_count !== s.capped_view_count && s.raw_view_count && (
                        <span className="text-xs text-gray-400 ml-1">(raw: {fmtViews(s.raw_view_count)})</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 tabular-nums">
                      {s.earnings_inr != null ? fmt(Number(s.earnings_inr)) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${SUB_STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                      {s.admin_notes && (
                        <p className="text-xs text-gray-400 mt-0.5 italic max-w-[160px] truncate" title={s.admin_notes}>
                          {s.admin_notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
