import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientSidebar from '@/components/client/Sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if ((profile as { role: string } | null)?.role !== 'client') redirect('/dashboard')

  return (
    <div className="app">
      <ClientSidebar
        userName={(profile as any)?.full_name ?? undefined}
      />
      <div className="main">
        {children}
      </div>
    </div>
  )
}
