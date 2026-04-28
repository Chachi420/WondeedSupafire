import { createAdminClient } from '@/lib/supabase/admin'
import CampaignQueue from '@/components/admin/CampaignQueue'
import SeedTestCampaignButton from '@/components/admin/SeedTestCampaignButton'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const db = createAdminClient()

  const { data: pending } = await db
    .from('campaigns')
    .select(`
      id, title, description, budget_inr, total_charged_inr,
      platform, start_date, end_date, per_post_view_cap, created_at,
      profiles!client_id ( full_name, phone )
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true })  // oldest first

  const { data: all, count } = await db
    .from('campaigns')
    .select('id, title, status, budget_inr, platform, created_at, profiles!client_id(full_name, phone)', { count: 'exact' })
    .in('status', ['active', 'completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and approve client campaign submissions</p>
        </div>
        <SeedTestCampaignButton />
      </div>

      {/* Approval queue */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Approval Queue</h2>
          {(pending?.length ?? 0) > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pending!.length} pending
            </span>
          )}
        </div>
        <CampaignQueue campaigns={(pending ?? []) as any} />
      </div>

      {/* Recently processed */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Recently Processed
          <span className="ml-2 text-sm font-normal text-gray-400">({count ?? 0} total)</span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!all?.length
            ? <p className="p-10 text-sm text-gray-400 text-center">No processed campaigns yet</p>
            : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((c: any) => {
                    const statusStyles: Record<string, string> = {
                      active:    'bg-green-100 text-green-800',
                      completed: 'bg-gray-100 text-gray-500',
                      cancelled: 'bg-red-100 text-red-700',
                    }
                    return (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{c.title}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{c.profiles?.full_name ?? c.profiles?.phone ?? '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(c.budget_inr)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 capitalize">{c.platform}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusStyles[c.status] ?? ''}`}>
                            {c.status}
                          </span>
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
