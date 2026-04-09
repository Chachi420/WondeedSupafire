import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientSidebar from '@/components/client/Sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'client') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
