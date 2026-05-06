import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  const [profileResult, pendingResult] = await Promise.all([
    supabase.from('profiles').select('role, full_name').eq('id', user.id).single(),
    db.from('campaign_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const profile = profileResult.data
  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/dashboard')

  const pendingCount = pendingResult.count ?? 0

  return (
    <div className="app">
      <AdminSidebar adminName={(profile as any)?.full_name ?? undefined} pendingCount={pendingCount} />
      <div className="main">
        {children}
      </div>
    </div>
  )
}
