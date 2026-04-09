import { createAdminClient } from '@/lib/supabase/admin'
import SubmissionQueue from '@/components/admin/SubmissionQueue'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
  const db = createAdminClient()

  const { data: pending } = await db
    .from('campaign_submissions')
    .select(`
      id, clip_url, platform, status, created_at,
      campaigns ( title, rate_per_million_inr, per_post_view_cap, budget_remaining_inr ),
      profiles ( full_name, phone )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: reviewed } = await db
    .from('campaign_submissions')
    .select(`
      id, clip_url, platform, status, raw_view_count, capped_view_count,
      earnings_inr, admin_notes, reviewed_at,
      campaigns ( title ),
      profiles ( full_name, phone )
    `)
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false })
    .limit(30)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review clipper submissions and enter view counts</p>
      </div>

      {/* Pending queue */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Pending Review</h2>
          {(pending?.length ?? 0) > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pending!.length} pending
            </span>
          )}
        </div>
        <SubmissionQueue submissions={(pending ?? []) as any} />
      </div>

      {/* Reviewed history */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recently Reviewed</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!reviewed?.length
            ? <p className="p-10 text-sm text-gray-400 text-center">No reviewed submissions yet</p>
            : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign / Clipper</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Views (raw / capped)</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Earned</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewed.map((s: any) => {
                    const fmtNum = (n: number | null) =>
                      n != null ? new Intl.NumberFormat('en-IN').format(n) : '—'
                    const fmtInr = (n: number | null) =>
                      n != null
                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
                        : '—'
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{(s.campaigns as any)?.title ?? '—'}</p>
                          <p className="text-xs text-gray-400">{(s.profiles as any)?.full_name ?? (s.profiles as any)?.phone ?? '—'}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{s.platform}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 tabular-nums">
                          {fmtNum(s.raw_view_count)} / {fmtNum(s.capped_view_count)}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900 tabular-nums">
                          {fmtInr(s.earnings_inr)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            s.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {s.status}
                          </span>
                          {s.admin_notes && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">{s.admin_notes}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">
                          {s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  )
}
