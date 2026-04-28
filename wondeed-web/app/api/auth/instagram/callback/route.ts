import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const GRAPH = 'https://graph.facebook.com/v19.0'

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Graph API error ${res.status}: ${await res.text()}`)
  return res.json()
}

// Step 2 — Facebook redirects here after the user grants permissions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code    = searchParams.get('code')
  const state   = searchParams.get('state')
  const errParam = searchParams.get('error_description')

  const baseRedirect = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clipper/profile`

  if (errParam || !code || !state) {
    const msg = errParam ?? 'Instagram connection cancelled'
    return NextResponse.redirect(`${baseRedirect}?ig_error=${encodeURIComponent(msg)}`)
  }

  // Recover userId from state
  let userId: string
  try {
    userId = Buffer.from(state, 'base64url').toString('utf8')
    // Basic UUID validation
    if (!/^[0-9a-f-]{36}$/.test(userId)) throw new Error('invalid')
  } catch {
    return NextResponse.redirect(`${baseRedirect}?ig_error=invalid_state`)
  }

  // Double-check the session user matches
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${baseRedirect}?ig_error=session_mismatch`)
  }

  const APP_ID     = process.env.INSTAGRAM_APP_ID!
  const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

  try {
    // ── 1. Exchange code for short-lived token ──────────────────────────────
    const tokenData = await fetchJson(
      `${GRAPH}/oauth/access_token?` +
      `client_id=${APP_ID}&client_secret=${APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`
    )
    const shortToken: string = tokenData.access_token

    // ── 2. Exchange for long-lived token (~60 days) ─────────────────────────
    const longTokenData = await fetchJson(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token` +
      `&client_id=${APP_ID}&client_secret=${APP_SECRET}` +
      `&fb_exchange_token=${encodeURIComponent(shortToken)}`
    )
    const longToken: string  = longTokenData.access_token
    const expiresIn: number  = longTokenData.expires_in ?? 5184000 // 60 days default
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // ── 3. Get user's Facebook Pages ────────────────────────────────────────
    const pagesData = await fetchJson(
      `${GRAPH}/me/accounts?access_token=${encodeURIComponent(longToken)}`
    )
    const pages: Array<{ id: string; access_token: string }> = pagesData.data ?? []

    if (!pages.length) {
      return NextResponse.redirect(
        `${baseRedirect}?ig_error=${encodeURIComponent(
          'No Facebook Pages found. Your Instagram business account must be linked to a Facebook Page.'
        )}`
      )
    }

    // ── 4. Find the Instagram business account connected to a Page ──────────
    let igAccountId: string | null = null
    let igUsername:  string | null = null

    for (const page of pages) {
      const pageData = await fetchJson(
        `${GRAPH}/${page.id}?fields=instagram_business_account&access_token=${encodeURIComponent(page.access_token)}`
      )
      if (pageData.instagram_business_account?.id) {
        igAccountId = pageData.instagram_business_account.id

        // ── 5. Get IG account username ──────────────────────────────────────
        const igData = await fetchJson(
          `${GRAPH}/${igAccountId}?fields=username,name&access_token=${encodeURIComponent(longToken)}`
        )
        igUsername = igData.username ?? null
        break
      }
    }

    if (!igAccountId || !igUsername) {
      return NextResponse.redirect(
        `${baseRedirect}?ig_error=${encodeURIComponent(
          'No Instagram Professional account found. Make sure you have a Business or Creator account linked to your Facebook Page.'
        )}`
      )
    }

    // ── 6. Store in clipper_social_accounts ─────────────────────────────────
    const db = createAdminClient()
    await db.from('clipper_social_accounts').upsert({
      clipper_id:                 userId,
      instagram_user_id:          igAccountId,
      instagram_username:         igUsername,
      instagram_access_token:     longToken,
      instagram_token_expires_at: tokenExpiresAt,
      instagram_connected_at:     new Date().toISOString(),
      updated_at:                 new Date().toISOString(),
    }, { onConflict: 'clipper_id' })

    return NextResponse.redirect(`${baseRedirect}?ig_connected=1`)
  } catch (err: any) {
    const msg = err.message ?? 'Unknown error'
    return NextResponse.redirect(`${baseRedirect}?ig_error=${encodeURIComponent(msg)}`)
  }
}
