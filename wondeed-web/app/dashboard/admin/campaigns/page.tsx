import { createAdminClient } from '@/lib/supabase/admin'
import CampaignQueue from '@/components/admin/CampaignQueue'
import CampaignCpmEditor from '@/components/admin/CampaignCpmEditor'
import SeedTestCampaignButton from '@/components/admin/SeedTestCampaignButton'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const db = createAdminClient()

  const { data: pending } = await db
    .from('campaigns')
    .select(`
      id, title, description, budget_inr, niche,
      platform, start_date, end_date, per_post_view_cap, created_at,
      profiles!client_id ( full_name, phone )
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true })

  const { data: all, count } = await db
    .from('campaigns')
    .select('id, title, status, budget_inr, platform, rate_per_million_inr, created_at, profiles!client_id(full_name, phone)', { count: 'exact' })
    .in('status', ['active', 'paused', 'completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <>
      <div className="topbar">
        <div className="col">
          <div className="row gap-12">
            <h1>Campaigns</h1>
            {(pending?.length ?? 0) > 0 && (
              <span className="badge badge-warn" style={{ padding: '4px 10px', fontSize: 12 }}>
                <span className="badge-dot" style={{ background: '#d97706' }} />
                {pending!.length} Pending
              </span>
            )}
          </div>
          <div className="topbar-sub">Review and approve client campaign submissions</div>
        </div>
        <div className="topbar-right">
          <SeedTestCampaignButton />
        </div>
      </div>

      <div className="content fade-up">
        <div className="card mb-20">
          <div className="card-head">
            <div>
              <h2>Approval Queue</h2>
              <div className="sub">Oldest first — campaigns waiting for review</div>
            </div>
          </div>
          <CampaignQueue campaigns={(pending ?? []) as any} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>All Campaigns</h2>
              <div className="sub">{count ?? 0} active / processed campaigns</div>
            </div>
          </div>
          <CampaignCpmEditor campaigns={(all ?? []) as any} />
        </div>
      </div>
    </>
  )
}
