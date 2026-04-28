import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchInstagramMetrics } from '@/lib/instagram/scraper'

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    const v = u.searchParams.get('v')
    if (v) return v
    const pathMatch = u.pathname.match(/\/(?:shorts|embed|v)\/([\w-]{11})/)
    if (pathMatch) return pathMatch[1]
    if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12)
    return null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const YT_API_KEY = process.env.YOUTUBE_API_KEY
  const db = createAdminClient()

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

  const { data: submissions, error: fetchErr } = await db
    .from('campaign_submissions')
    .select('id, clip_url, platform, clipper_id')
    .eq('status', 'pending')
    .or(`last_refreshed_at.is.null,last_refreshed_at.lt.${sixHoursAgo}`)
    .limit(50)

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  let refreshed = 0
  let failed    = 0

  for (const sub of submissions ?? []) {
    try {
      if (sub.platform === 'youtube' && YT_API_KEY) {
        const videoId = extractYouTubeVideoId(sub.clip_url)
        if (!videoId) { failed++; continue }

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YT_API_KEY}`
        )
        if (!res.ok) { failed++; continue }

        const data = await res.json()
        if (!data.items?.length) { failed++; continue }

        const stats = data.items[0].statistics
        await db.from('campaign_submissions').update({
          live_view_count:    parseInt(stats.viewCount    ?? '0', 10),
          live_like_count:    parseInt(stats.likeCount    ?? '0', 10),
          live_comment_count: parseInt(stats.commentCount ?? '0', 10),
          view_count_source:  'youtube_api',
          last_refreshed_at:  new Date().toISOString(),
        }).eq('id', sub.id)
        refreshed++

      } else if (sub.platform === 'instagram') {
        const metrics = await fetchInstagramMetrics(sub.clip_url)
        if (!metrics) { failed++; continue }

        await db.from('campaign_submissions').update({
          live_view_count:    metrics.viewCount,
          live_like_count:    metrics.likeCount,
          live_comment_count: metrics.commentCount,
          view_count_source:  'instagram_api',
          last_refreshed_at:  new Date().toISOString(),
        }).eq('id', sub.id)
        refreshed++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return NextResponse.json({
    ok: true,
    total: (submissions ?? []).length,
    refreshed,
    failed,
  })
}
