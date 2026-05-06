import { createAdminClient } from '@/lib/supabase/admin'
import ClipperApprovalQueue from '@/components/admin/ClipperApprovalQueue'

export const dynamic = 'force-dynamic'

export default async function AdminClippersPage() {
  const db = createAdminClient()

  const { data: clippers } = await db
    .from('profiles')
    .select('id, phone, full_name, account_status, subscription_tier, created_at')
    .eq('role', 'clipper')
    .order('created_at', { ascending: false })

  const { data: socialAccounts } = await db
    .from('clipper_social_accounts')
    .select('clipper_id, youtube_channel_handle, youtube_channel_title, youtube_verified_at, instagram_username, instagram_connected_at')

  const socialByClipperId = Object.fromEntries(
    (socialAccounts ?? []).map(s => [s.clipper_id, s])
  )

  const pending   = (clippers ?? []).filter(c => c.account_status === 'pending').length
  const active    = (clippers ?? []).filter(c => c.account_status === 'active').length
  const suspended = (clippers ?? []).filter(c => c.account_status === 'suspended').length

  return (
    <>
      <div className="topbar">
        <div className="col">
          <div className="row gap-12">
            <h1>Clipper Approvals</h1>
            {pending > 0 && (
              <span className="badge badge-warn" style={{ padding: '4px 10px', fontSize: 12 }}>
                <span className="badge-dot" style={{ background: '#d97706' }} />
                {pending} Pending
              </span>
            )}
          </div>
          <div className="topbar-sub">Review and approve new clipper accounts</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-ico ico-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">{pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico ico-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{active}</div>
          </div>
          <div className="stat-card">
            <div className="stat-ico" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6m0-6l6 6"/>
              </svg>
            </div>
            <div className="stat-label">Suspended</div>
            <div className="stat-value">{suspended}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Clipper List</h2>
              <div className="sub">{(clippers ?? []).length} total clippers</div>
            </div>
          </div>
          <ClipperApprovalQueue
            clippers={(clippers ?? []) as any}
            socialByClipperId={socialByClipperId}
          />
        </div>
      </div>
    </>
  )
}
