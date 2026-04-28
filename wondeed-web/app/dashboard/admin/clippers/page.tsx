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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clipper Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and approve new clipper accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <p className="text-xs text-amber-600 font-medium mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-amber-700">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-5">
          <p className="text-xs text-emerald-600 font-medium mb-1">Active</p>
          <p className="text-3xl font-bold text-emerald-700">{active}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <p className="text-xs text-red-600 font-medium mb-1">Suspended</p>
          <p className="text-3xl font-bold text-red-700">{suspended}</p>
        </div>
      </div>

      <ClipperApprovalQueue
        clippers={(clippers ?? []) as any}
        socialByClipperId={socialByClipperId}
      />
    </div>
  )
}
