import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: string } | null)?.role
  if (role === 'admin')   redirect('/dashboard/admin')
  if (role === 'client')  redirect('/dashboard/client')
  if (role === 'clipper') redirect('/dashboard/clipper')

  // New user (e.g. signed in via Google) — no role assigned yet
  redirect('/onboard')
}
