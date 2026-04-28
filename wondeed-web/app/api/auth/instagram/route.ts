import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Step 1 — redirect clipper to Facebook OAuth dialog
// Called from the "Connect Instagram" button
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const APP_ID = process.env.INSTAGRAM_APP_ID
  if (!APP_ID) {
    return NextResponse.json({ error: 'Instagram OAuth not configured' }, { status: 503 })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

  // state = base64(userId) — verified in callback to prevent CSRF
  const state = Buffer.from(user.id).toString('base64url')

  const oauthUrl = new URL('https://www.facebook.com/dialog/oauth')
  oauthUrl.searchParams.set('client_id', APP_ID)
  oauthUrl.searchParams.set('redirect_uri', redirectUri)
  oauthUrl.searchParams.set('state', state)
  // instagram_basic: read profile + media
  // instagram_manage_insights: read reach/impressions on media
  // pages_show_list + pages_read_engagement: needed to find the linked IG business account
  oauthUrl.searchParams.set('scope', [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
  ].join(','))

  return NextResponse.redirect(oauthUrl.toString())
}
