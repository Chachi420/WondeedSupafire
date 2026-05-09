import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClipperSidebar from '@/components/clipper/Sidebar'
import { PendingApprovalScreen, SuspendedScreen } from '@/components/clipper/StatusScreens'

export default async function ClipperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, account_status').eq('id', user.id).single()

  if ((profile as { role: string } | null)?.role !== 'clipper') redirect('/dashboard')

  const status = (profile as { account_status?: string } | null)?.account_status ?? 'active'

  if (status === 'pending') return <PendingApprovalScreen />
  if (status === 'suspended') return <SuspendedScreen />

  const [fullProfileResult, feedCountResult] = await Promise.all([
    supabase.from('profiles').select('full_name, subscription_tier, phone').eq('id', user.id).single(),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const fullProfile = fullProfileResult.data
  const feedBadge = feedCountResult.count ?? 0

  return (
    <div className="app">
      <ClipperSidebar
        userName={(fullProfile as any)?.full_name ?? undefined}
        userHandle={(fullProfile as any)?.phone ?? undefined}
        userTier={(fullProfile as any)?.subscription_tier ?? 'Free'}
        feedBadge={feedBadge}
      />
      <div className="main">
        {children}
      </div>
    </div>
  )
}
