import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        const role = profile?.role
        if (role === 'client')  return NextResponse.redirect(`${origin}/dashboard/client`)
        if (role === 'clipper') return NextResponse.redirect(`${origin}/dashboard/clipper`)
        if (role === 'admin')   return NextResponse.redirect(`${origin}/dashboard/admin`)
        return NextResponse.redirect(`${origin}/onboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
