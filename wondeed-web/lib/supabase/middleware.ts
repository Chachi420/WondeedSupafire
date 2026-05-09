import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

const ROLE_HOME: Record<UserRole, string> = {
  client:  '/dashboard/client',
  clipper: '/dashboard/clipper',
  admin:   '/dashboard/admin',
}

const DASHBOARD_ROLE: Array<{ prefix: string; role: UserRole }> = [
  { prefix: '/dashboard/client',  role: 'client'  },
  { prefix: '/dashboard/clipper', role: 'clipper' },
  { prefix: '/dashboard/admin',   role: 'admin'   },
]

const PUBLIC_PATHS = [
  '/', '/login',
  '/brands', '/clippers', '/pricing', '/trust', '/faq',
  '/about', '/careers', '/blog', '/press',
  '/help', '/creator-guide', '/brand-playbook', '/developers',
  '/terms', '/privacy', '/refund', '/gst', '/grievance',
]

async function getRole(supabase: ReturnType<typeof createServerClient<Database>>, userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data as { role: UserRole } | null)?.role ?? null
}

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
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/api/auth')

  // Not authenticated → redirect to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated on public paths → redirect to role dashboard
  if (user && isPublic) {
    const role = await getRole(supabase, user.id)
    if (role) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[role]
      return NextResponse.redirect(url)
    }
  }

  // /dashboard (bare) → redirect to role dashboard
  if (user && pathname === '/dashboard') {
    const role = await getRole(supabase, user.id)
    if (role) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_HOME[role]
      return NextResponse.redirect(url)
    }
  }

  // Wrong-role dashboard → redirect to correct dashboard
  if (user && pathname.startsWith('/dashboard/')) {
    const matched = DASHBOARD_ROLE.find(({ prefix }) => pathname.startsWith(prefix))
    if (matched) {
      const role = await getRole(supabase, user.id)
      if (role && role !== matched.role) {
        const url = request.nextUrl.clone()
        url.pathname = ROLE_HOME[role]
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
