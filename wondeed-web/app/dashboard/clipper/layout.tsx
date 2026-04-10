import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClipperSidebar from '@/components/clipper/Sidebar'

export default async function ClipperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if ((profile as { role: string } | null)?.role !== 'clipper') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <ClipperSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
