import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

const ROLE_HOME: Record<UserRole, string> = {
  client:  '/dashboard/client',
  clipper: '/dashboard/clipper',
  admin:   '/dashboard/admin',
}

// Which role is required for each dashboard prefix
const DASHBOARD_ROLE: Array<{ prefix: string; role: UserRole }> = [
  { prefix: '/dashboard/client',  role: 'client'  },
  { prefix: '/dashboard/clipper', role: 'clipper' },
  { prefix: '/dashboard/admin',   role: 'admin'   },
]

const PUBLIC_PATHS = ['/', '/login']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add code between createServerClient and getUser()
  // that reads request cookies. See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/api/auth')

  // Not authenticated → redirect to login (unless on public path)
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user on public paths → redirect to their dashboard
  if (user && isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[profile.role]
      return NextResponse.redirect(url)
    }
  }

  // Authenticated user on /dashboard (no suffix) → redirect to role home
  if (user && pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[profile.role]
      return NextResponse.redirect(url)
    }
  }

  // Authenticated user accessing a wrong-role dashboard → redirect to their dashboard
  if (user && pathname.startsWith('/dashboard/')) {
    const matchedDashboard = DASHBOARD_ROLE.find(({ prefix }) =>
      pathname.startsWith(prefix)
    )

    if (matchedDashboard) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role && profile.role !== matchedDashboard.role) {
        const url = request.nextUrl.clone()
        url.pathname = ROLE_HOME[profile.role]
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
