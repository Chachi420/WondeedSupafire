import { createAdminClient } from '@/lib/supabase/admin'
import UserTable from '@/components/admin/UserTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const db = createAdminClient()

  const { data: users, count } = await db
    .from('profiles')
    .select(`
      id, phone, full_name, role, created_at,
      wallets ( balance_inr, total_credited_inr, total_debited_inr )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {count ?? 0} registered users · Click a role to change it
        </p>
      </div>

      <UserTable
        users={(users ?? []).map((u: any) => ({
          ...u,
          wallets: Array.isArray(u.wallets) ? u.wallets[0] ?? null : u.wallets,
        }))}
      />
    </div>
  )
}
