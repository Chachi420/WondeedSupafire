import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a response we can attach cookies to
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Unauthenticated → /login ─────────────────────────────
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Authenticated on /login or / → role-based dashboard ─
  if (user && (pathname === '/login' || pathname === '/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'clipper'
    const dest =
      role === 'admin'   ? '/dashboard/admin' :
      role === 'client'  ? '/dashboard/client' :
                           '/dashboard/clipper'

    return NextResponse.redirect(new URL(dest, request.url))
  }

  // ── Role guard: prevent cross-dashboard access ───────────
  if (user && pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'clipper'

    const isAdminPath   = pathname.startsWith('/dashboard/admin')
    const isClientPath  = pathname.startsWith('/dashboard/client')
    const isClipperPath = pathname.startsWith('/dashboard/clipper')

    if (isAdminPath   && role !== 'admin')   return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    if (isClientPath  && role !== 'client')  return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    if (isClipperPath && role !== 'clipper') return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))

    // /dashboard → redirect to role dashboard
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
