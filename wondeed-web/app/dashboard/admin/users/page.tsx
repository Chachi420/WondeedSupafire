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
    <>
      <div className="topbar">
        <div className="col">
          <h1>Users</h1>
          <div className="topbar-sub">{count ?? 0} registered users · Click a role to change it</div>
        </div>
      </div>

      <div className="content fade-up">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>All Users</h2>
              <div className="sub">Manage roles and view wallet balances</div>
            </div>
          </div>
          <UserTable
            users={(users ?? []).map((u: any) => ({
              ...u,
              wallets: Array.isArray(u.wallets) ? u.wallets[0] ?? null : u.wallets,
            }))}
          />
        </div>
      </div>
    </>
  )
}
