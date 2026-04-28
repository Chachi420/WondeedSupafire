const RAPIDAPI_HOST = 'instagram-scraper-stable-api.p.rapidapi.com'

export interface InstagramPostMetrics {
  viewCount:    number | null
  likeCount:    number | null
  commentCount: number | null
  ownerUsername: string | null
}

function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/)
  return match ? match[1] : null
}

export async function fetchInstagramMetrics(postUrl: string): Promise<InstagramPostMetrics | null> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return null

  const shortcode = extractShortcode(postUrl)
  if (!shortcode) return null

  try {
    // Endpoint: GET /get_media_data_v2.php?media_code={shortcode}
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/get_media_data_v2.php?media_code=${encodeURIComponent(shortcode)}`,
      {
        headers: {
          'Content-Type':    'application/json',
          'x-rapidapi-key':  apiKey,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) return null

    const json = await res.json()
    const d = json?.data ?? json

    if (!d) return null

    // play_count is the Reels-specific view metric; fall back to view_count for regular posts
    const viewCount =
      d.play_count       != null ? Number(d.play_count)       :
      d.video_play_count != null ? Number(d.video_play_count) :
      d.view_count       != null ? Number(d.view_count)       :
      null

    return {
      viewCount,
      likeCount:     d.like_count    != null ? Number(d.like_count)    : null,
      commentCount:  d.comment_count != null ? Number(d.comment_count) : null,
      ownerUsername: d.owner?.username ?? null,
    }
  } catch {
    return null
  }
}
